import type { AuthoredBook } from "./authored-book";

export interface BookTimelinePage {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  segmentDurations: number[];
}

export interface BookTimelineClip {
  id: string;
  asset: string;
  kind: "narration" | "soundtrack";
  start: number;
  end: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
}

export interface BookTimeline {
  pages: BookTimelinePage[];
  clips: BookTimelineClip[];
  total: number;
}

const emptyTimeline = (): BookTimeline => ({ pages: [], clips: [], total: 0 });
const finite = (value: number, label: string, allowZero = false) => {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0))
    throw new Error(
      `${label} must be ${allowZero ? "non-negative" : "positive"}.`,
    );
  return value;
};
const measured = (
  asset: string,
  fallback: number,
  durations: Record<string, number>,
) => finite(durations[asset] ?? fallback, `Duration for '${asset}'`);

/** Build the one continuous, content-time timeline used by playback and page UI. */
export function buildBookTimeline(
  book: AuthoredBook,
  durations: Record<string, number> = {},
): BookTimeline {
  const pages: BookTimelinePage[] = [];
  const clips: BookTimelineClip[] = [];
  let cursor = 0;
  const narrationVolume = finite(
    book.narrationVolume ?? 1,
    "Narration volume",
    true,
  );
  if (narrationVolume > 1)
    throw new Error("Narration volume must not exceed 1.");

  book.spreads.forEach((spread, index) => {
    const minimum = finite(spread.seconds ?? 8, `Page '${spread.id}' seconds`);
    const segmentDurations = spread.segments.map((segment) =>
      segment.narration
        ? measured(
            segment.narration.asset,
            segment.narration.duration,
            durations,
          )
        : 0,
    );
    const narrationDuration = segmentDurations.reduce(
      (sum, duration) => sum + duration,
      0,
    );
    const duration = Math.max(minimum, narrationDuration);
    const page: BookTimelinePage = {
      id: spread.id,
      index,
      start: cursor,
      end: cursor + duration,
      duration,
      segmentDurations,
    };
    pages.push(page);

    const narrationIsCurrent = spread.segments.every(
      (segment) =>
        segment.narration && segment.narration.recordedText === segment.text,
    );
    if (narrationIsCurrent) {
      let start = page.start;
      spread.segments.forEach((segment, segmentIndex) => {
        const narration = segment.narration!;
        const end = start + segmentDurations[segmentIndex];
        clips.push({
          id: `${spread.id}:${segment.id}`,
          asset: narration.asset,
          kind: "narration",
          start,
          end,
          volume: narrationVolume,
          fadeIn: 0,
          fadeOut: 0,
          loop: false,
        });
        start = end;
      });
    }
    cursor = page.end;
  });

  const pageById = new Map(pages.map((page) => [page.id, page]));
  for (const track of book.soundtracks ?? []) {
    const first = pageById.get(track.startPage);
    const last = pageById.get(track.endPage);
    if (!first)
      throw new Error(`Soundtrack '${track.id}' has an unknown start page.`);
    if (!last)
      throw new Error(`Soundtrack '${track.id}' has an unknown end page.`);
    if (first.index > last.index)
      throw new Error(`Soundtrack '${track.id}' page range is reversed.`);
    const startOffset = finite(
      track.startOffset,
      `Soundtrack '${track.id}' start offset`,
      true,
    );
    const endOffset = finite(
      track.endOffset,
      `Soundtrack '${track.id}' end offset`,
      true,
    );
    const volume = finite(
      track.volume,
      `Soundtrack '${track.id}' volume`,
      true,
    );
    if (volume > 1)
      throw new Error(`Soundtrack '${track.id}' volume must not exceed 1.`);
    const authoredFadeIn = finite(
      track.fadeIn,
      `Soundtrack '${track.id}' fade in`,
      true,
    );
    const authoredFadeOut = finite(
      track.fadeOut,
      `Soundtrack '${track.id}' fade out`,
      true,
    );
    const start = first.start + startOffset;
    const rangeEnd = last.end - endOffset;
    if (start >= rangeEnd)
      throw new Error(
        `Soundtrack '${track.id}' offsets leave no playable time.`,
      );
    const naturalDuration = durations[track.asset];
    if (naturalDuration !== undefined)
      finite(naturalDuration, `Duration for '${track.asset}'`);
    const end = track.loop
      ? rangeEnd
      : Math.min(rangeEnd, start + (naturalDuration ?? rangeEnd - start));
    const clipDuration = end - start;
    if (clipDuration <= 0)
      throw new Error(`Soundtrack '${track.id}' has no playable audio.`);
    clips.push({
      id: track.id,
      asset: track.asset,
      kind: "soundtrack",
      start,
      end,
      volume,
      fadeIn: Math.min(authoredFadeIn, clipDuration),
      fadeOut: Math.min(authoredFadeOut, clipDuration),
      loop: track.loop,
    });
  }

  return { pages, clips, total: cursor };
}

const assetUrl = (src: string) => (src.startsWith("data:") ? src : `./${src}`);

type ScheduledAudio = {
  key: string;
  clip: BookTimelineClip;
  source: AudioBufferSourceNode;
  gain: GainNode;
  when: number;
  retiring: boolean;
  loopInitialGain?: number;
  loopFadeInEnd?: number;
  loopTransition?: {
    start: number;
    end: number;
    from: number;
    to: number;
  };
  loopEndAt?: number;
  loopEndTimer?: ReturnType<typeof setTimeout>;
};

/** Full-book Web Audio transport. Timeline positions are always unscaled content seconds. */
export class BookAudio {
  timeline: BookTimeline = emptyTimeline();
  private buffers = new Map<string, AudioBuffer>();
  private measuredDurations: Record<string, number> = {};
  private sourceBook?: AuthoredBook;
  private loadAbort?: AbortController;
  private prefetchAbort?: AbortController;
  private prefetchTimer?: ReturnType<typeof setTimeout>;
  private prefetched = new Map<string, ArrayBuffer>();
  private adjacent?: { book: AuthoredBook; pageIndex: number };
  private scheduled = new Map<string, ScheduledAudio>();
  private retiring = new Set<ScheduledAudio>();
  private master: GainNode;
  private generation = 0;
  private playRequest = 0;
  private cursor = 0;
  private anchor = 0;
  private active = false;
  private rate = 1;
  private rangeStart = 0;
  private rangeEnd = 0;
  private disposed = false;

  constructor(private readonly context: AudioContext) {
    this.master = context.createGain();
    this.master.gain.value = 1;
    this.master.connect(context.destination);
  }

  get position() {
    const position =
      this.cursor +
      (this.active ? (this.context.currentTime - this.anchor) * this.rate : 0);
    return Math.max(this.rangeStart, Math.min(this.rangeEnd, position));
  }

  get playing() {
    return (
      (this.active && this.position < this.rangeEnd) ||
      [...this.scheduled.values(), ...this.retiring].some(
        ({ clip, loopEndAt }) =>
          clip.kind === "soundtrack" &&
          (loopEndAt === undefined || loopEndAt > this.context.currentTime),
      )
    );
  }

  /** Observable media residency for profiling and low-memory regression tests. */
  get cacheFootprint() {
    return {
      decodedBuffers: this.buffers.size,
      decodedBytes: [...this.buffers.values()].reduce(
        (bytes, buffer) =>
          bytes + (buffer.length || 0) * (buffer.numberOfChannels || 0) * 4,
        0,
      ),
      encodedBuffers: this.prefetched.size,
      encodedBytes: [...this.prefetched.values()].reduce(
        (bytes, buffer) => bytes + buffer.byteLength,
        0,
      ),
    };
  }

  private disconnect(entry: ScheduledAudio) {
    if (this.scheduled.get(entry.key) === entry)
      this.scheduled.delete(entry.key);
    this.retiring.delete(entry);
    if (entry.loopEndTimer !== undefined) clearTimeout(entry.loopEndTimer);
    entry.source.onended = null;
    entry.source.disconnect();
    entry.gain.disconnect();
  }

  private stopEntry(entry: ScheduledAudio, fade = 0) {
    if (entry.retiring && fade > 0) return;
    if (entry.retiring) {
      try {
        entry.source.stop();
      } catch {
        // A source may already have ended naturally.
      }
      this.disconnect(entry);
      return;
    }
    entry.retiring = true;
    if (entry.loopEndTimer !== undefined) {
      clearTimeout(entry.loopEndTimer);
      entry.loopEndTimer = undefined;
    }
    const now = this.context.currentTime;
    // A future layer has not become audible yet, so cancel it without a fade.
    if (fade > 0 && entry.when <= now) {
      this.retiring.add(entry);
      const parameter = entry.gain.gain;
      try {
        parameter.cancelScheduledValues(now);
        parameter.setValueAtTime(parameter.value, now);
        parameter.linearRampToValueAtTime(0, now + fade);
        entry.source.stop(now + fade);
      } catch {
        try {
          entry.source.stop();
        } catch {
          // A source may already have ended naturally.
        }
        this.disconnect(entry);
      }
      return;
    }
    try {
      entry.source.stop();
    } catch {
      // A source may already have ended naturally.
    }
    this.disconnect(entry);
  }

  private unschedule(kind?: BookTimelineClip["kind"]) {
    for (const entry of new Set([...this.scheduled.values(), ...this.retiring]))
      if (!kind || entry.clip.kind === kind) this.stopEntry(entry);
  }

  private pageSoundtracks() {
    return this.timeline.clips.filter(
      (clip) =>
        clip.kind === "soundtrack" &&
        clip.end > this.rangeStart &&
        clip.start < this.rangeEnd,
    );
  }

  private reconcileSoundtracks(preserve: boolean) {
    const desired = new Set(
      this.pageSoundtracks().map((clip) => `track:${clip.id}`),
    );
    for (const entry of [...this.scheduled.values()]) {
      if (entry.clip.kind !== "soundtrack") continue;
      if (preserve && desired.has(entry.key) && !entry.retiring) continue;
      this.stopEntry(entry, preserve ? entry.clip.fadeOut || 0.35 : 0);
    }
  }

  private loopGainAt(entry: ScheduledAudio, time: number) {
    const transition = entry.loopTransition;
    if (transition && time >= transition.start) {
      if (time >= transition.end) return transition.to;
      if (transition.end <= transition.start) return transition.to;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (time - transition.start) / (transition.end - transition.start),
        ),
      );
      return transition.from + (transition.to - transition.from) * progress;
    }
    const fadeInEnd = entry.loopFadeInEnd ?? entry.when;
    const initial = entry.loopInitialGain ?? entry.clip.volume;
    if (time < fadeInEnd && fadeInEnd > entry.when) {
      const progress = Math.max(
        0,
        Math.min(1, (time - entry.when) / (fadeInEnd - entry.when)),
      );
      return initial + (entry.clip.volume - initial) * progress;
    }
    return entry.clip.volume;
  }

  /** Apply a loop's final-page fade against AudioContext time, and cancel it on a back-turn. */
  private updateLoopEnd(entry: ScheduledAudio, position: number, now: number) {
    if (!entry.clip.loop || entry.clip.kind !== "soundtrack") return;
    const clip = entry.clip;
    const endsInsideCurrentPage =
      clip.end > this.rangeStart && clip.end < this.rangeEnd;
    if (!endsInsideCurrentPage) {
      if (entry.loopEndTimer !== undefined) {
        clearTimeout(entry.loopEndTimer);
        entry.loopEndTimer = undefined;
      }
      if (entry.loopEndAt !== undefined) {
        const level = this.loopGainAt(entry, now);
        const restoreDuration = 0.35 / this.rate;
        const parameter = entry.gain.gain;
        parameter.cancelScheduledValues(now);
        parameter.setValueAtTime(level, now);
        parameter.linearRampToValueAtTime(clip.volume, now + restoreDuration);
        entry.loopTransition = {
          start: now,
          end: now + restoreDuration,
          from: level,
          to: clip.volume,
        };
        entry.loopEndAt = undefined;
      }
      return;
    }

    const remaining = clip.end - position;
    if (remaining <= 0) {
      this.stopEntry(entry);
      return;
    }
    if (entry.loopEndTimer !== undefined) {
      clearTimeout(entry.loopEndTimer);
      entry.loopEndTimer = undefined;
    }

    const endAt = now + remaining / this.rate;
    const fadeSeconds = Math.min(clip.fadeOut, remaining) / this.rate;
    const fadeAt = endAt - fadeSeconds;
    const levelNow = this.loopGainAt(entry, now);
    const levelAtFade = this.loopGainAt(entry, Math.max(now, fadeAt));
    const parameter = entry.gain.gain;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(levelNow, now);
    if (fadeAt > now) {
      parameter.linearRampToValueAtTime(levelAtFade, fadeAt);
      if (fadeSeconds > 0) parameter.linearRampToValueAtTime(0, endAt);
      else parameter.setValueAtTime(0, endAt);
    } else if (fadeSeconds > 0) {
      parameter.linearRampToValueAtTime(0, endAt);
    } else {
      parameter.setValueAtTime(0, endAt);
    }
    entry.loopTransition = {
      start: Math.max(now, fadeAt),
      end: endAt,
      from: fadeSeconds > 0 ? levelAtFade : 0,
      to: 0,
    };
    entry.loopEndAt = endAt;

    const checkEnd = () => {
      if (entry.loopEndAt !== endAt || this.disposed) return;
      const delay = endAt - this.context.currentTime;
      if (delay > 0.005) {
        entry.loopEndTimer = setTimeout(checkEnd, Math.min(delay * 1000, 250));
        return;
      }
      entry.loopEndTimer = undefined;
      try {
        entry.source.stop();
      } catch {
        // The source may already have ended naturally.
      }
    };
    entry.loopEndTimer = setTimeout(
      checkEnd,
      Math.max(0, (endAt - this.context.currentTime) * 1000),
    );
  }

  private referencedAudio(book: AuthoredBook) {
    const ids: string[] = [];
    const add = (id: string) => {
      if (!ids.includes(id)) ids.push(id);
    };
    for (const spread of book.spreads)
      for (const segment of spread.segments)
        if (segment.narration) add(segment.narration.asset);
    for (const track of book.soundtracks ?? []) add(track.asset);
    for (const id of ids) {
      const asset = book.assets[id];
      if (!asset || asset.kind !== "audio")
        throw new Error(`Audio asset '${id}' is missing or is not audio.`);
      if (
        !asset.src.startsWith("data:") &&
        !/^(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+\.(wav|mp3|ogg)$/.test(
          asset.src,
        )
      )
        throw new Error(`Audio asset '${id}' has an unsafe source.`);
      if (
        asset.src.startsWith("data:") &&
        !/^data:audio\/(wav|x-wav|mpeg|ogg);base64,[A-Za-z0-9+/]+=*$/.test(
          asset.src,
        )
      )
        throw new Error(`Audio asset '${id}' has an unsupported data URL.`);
    }
    return ids;
  }

  private pageAudio(
    book: AuthoredBook,
    pageIndex: number,
    timeline = this.timeline,
  ) {
    const page = timeline.pages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex} is not in this book.`);
    const needed = new Set(
      timeline.clips
        .filter((clip) => clip.start < page.end && clip.end > page.start)
        .map((clip) => clip.asset),
    );
    return this.referencedAudio(book).filter((id) => needed.has(id));
  }

  private async fetchAudio(
    book: AuthoredBook,
    ids: string[],
    token: number,
    existing: Map<string, AudioBuffer>,
  ) {
    const controller = new AbortController();
    this.loadAbort = controller;
    const loaded = new Map<string, AudioBuffer>();
    try {
      // A page commonly has narration and a soundscape. Fetch them together
      // but cap full-book loads so a weak phone never creates a request storm.
      let next = 0;
      const workers = Array.from(
        { length: Math.min(3, ids.length) },
        async () => {
          while (next < ids.length) {
            const id = ids[next++];
            const cached = existing.get(id);
            if (cached) {
              loaded.set(id, cached);
              continue;
            }
            let encoded = this.prefetched.get(id);
            this.prefetched.delete(id);
            if (!encoded) {
              const response = await fetch(assetUrl(book.assets[id].src), {
                signal: controller.signal,
              });
              if (!response.ok)
                throw new Error(`Audio asset '${id}' could not load.`);
              encoded = await response.arrayBuffer();
            }
            const buffer = await this.context.decodeAudioData(encoded);
            if (token !== this.generation) return;
            finite(buffer.duration, `Decoded duration for '${id}'`);
            loaded.set(id, buffer);
          }
        },
      );
      await Promise.all(workers);
      return token === this.generation ? loaded : null;
    } catch (error) {
      controller.abort();
      if (token !== this.generation) return null;
      throw error;
    } finally {
      if (this.loadAbort === controller) this.loadAbort = undefined;
    }
  }

  /** Keep at most one adjacent page of encoded cues, never decoded PCM. */
  private queueAdjacentPage(book: AuthoredBook, pageIndex: number) {
    if (this.prefetchTimer) clearTimeout(this.prefetchTimer);
    this.prefetchAbort?.abort();
    this.prefetchAbort = undefined;
    this.prefetched.clear();
    if (typeof window === "undefined" || pageIndex >= book.spreads.length)
      return;
    if (
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData
    )
      return;
    this.prefetchTimer = setTimeout(() => {
      this.prefetchTimer = undefined;
      if (this.sourceBook !== book || this.disposed) return;
      const controller = new AbortController();
      this.prefetchAbort = controller;
      const ids = this.pageAudio(book, pageIndex)
        .filter((id) => !this.buffers.has(id))
        .slice(0, 2);
      void (async () => {
        let bytes = 0;
        for (const id of ids) {
          try {
            const response = await fetch(assetUrl(book.assets[id].src), {
              signal: controller.signal,
            });
            if (!response.ok) break;
            const statedSize = Number(response.headers?.get("content-length"));
            if (statedSize > 512_000 - bytes) break;
            const encoded = await response.arrayBuffer();
            if (
              controller.signal.aborted ||
              bytes + encoded.byteLength > 512_000
            )
              break;
            bytes += encoded.byteLength;
            this.prefetched.set(id, encoded);
          } catch {
            break; // Adjacent preparation is optional; the page retries normally.
          }
        }
        if (this.prefetchAbort === controller) this.prefetchAbort = undefined;
      })();
    }, 1200);
  }

  async load(book: AuthoredBook, pageIndex?: number): Promise<boolean> {
    if (this.disposed) throw new Error("Book audio has been disposed.");
    this.loadAbort?.abort();
    this.prefetchAbort?.abort();
    if (this.prefetchTimer) clearTimeout(this.prefetchTimer);
    this.prefetched.clear();
    this.adjacent = undefined;
    const token = ++this.generation;
    this.playRequest++;
    this.active = false;
    this.unschedule();
    this.buffers.clear();
    this.measuredDurations = {};
    this.sourceBook = undefined;
    this.timeline = emptyTimeline();
    this.cursor = this.rangeStart = this.rangeEnd = 0;
    // Validate authored timing before performing I/O.
    const authoredTimeline = buildBookTimeline(book);
    const ids =
      pageIndex === undefined
        ? this.referencedAudio(book)
        : this.pageAudio(book, pageIndex, authoredTimeline);
    const loaded = await this.fetchAudio(book, ids, token, new Map());
    if (!loaded) return false;
    this.measuredDurations = Object.fromEntries(
      [...loaded].map(([id, buffer]) => [id, buffer.duration]),
    );
    this.timeline = buildBookTimeline(book, this.measuredDurations);
    this.buffers = loaded;
    this.sourceBook = book;
    this.rangeEnd = this.timeline.total;
    if (pageIndex !== undefined)
      this.adjacent = { book, pageIndex: pageIndex + 1 };
    return true;
  }

  /** Decode only the destination page. Keep soundtrack sources audible across turns. */
  async loadPage(book: AuthoredBook, pageIndex: number): Promise<boolean> {
    if (this.disposed || this.sourceBook !== book)
      throw new Error("Load the book before changing audio pages.");
    this.loadAbort?.abort();
    this.prefetchAbort?.abort();
    if (this.prefetchTimer) clearTimeout(this.prefetchTimer);
    const token = ++this.generation;
    const ids = this.pageAudio(book, pageIndex);
    const loaded = await this.fetchAudio(book, ids, token, this.buffers);
    if (!loaded) return false;
    for (const [id, buffer] of loaded)
      this.measuredDurations[id] = buffer.duration;
    this.timeline = buildBookTimeline(book, this.measuredDurations);
    this.buffers = loaded;
    this.adjacent = { book, pageIndex: pageIndex + 1 };
    return true;
  }

  private gainAt(clip: BookTimelineClip, position: number) {
    const fadeIn = clip.fadeIn
      ? Math.max(0, Math.min(1, (position - clip.start) / clip.fadeIn))
      : 1;
    const fadeOut = clip.fadeOut
      ? Math.max(0, Math.min(1, (clip.end - position) / clip.fadeOut))
      : 1;
    return clip.volume * Math.min(fadeIn, fadeOut);
  }

  private schedule() {
    this.unschedule("narration");
    this.reconcileSoundtracks(true);
    const position = this.position;
    const now = this.context.currentTime;
    for (const clip of this.timeline.clips) {
      const buffer = this.buffers.get(clip.asset);
      const start = Math.max(position, this.rangeStart, clip.start);
      if (!buffer) continue;
      if (clip.kind === "soundtrack") {
        const key = `track:${clip.id}`;
        const previous = this.scheduled.get(key);
        if (previous && !previous.retiring) {
          this.updateLoopEnd(previous, position, now);
          continue;
        }
        if (clip.end <= this.rangeStart || clip.start >= this.rangeEnd)
          continue;
        if (clip.end <= start) continue;
        const when = now + Math.max(0, start - position) / this.rate;
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        source.buffer = buffer;
        source.loop = clip.loop;
        source.playbackRate.value = this.rate;
        source.connect(gain);
        gain.connect(this.master);
        const offset = clip.loop
          ? ((Math.max(0, start - clip.start) % buffer.duration) +
              buffer.duration) %
            buffer.duration
          : start - clip.start;
        const parameter = gain.gain;
        parameter.cancelScheduledValues(when);
        let loopInitialGain: number | undefined;
        let loopFadeInEnd: number | undefined;
        if (clip.loop) {
          const elapsed = Math.max(0, start - clip.start);
          const remainingAuthoredFade = Math.max(0, clip.fadeIn - elapsed);
          const fade = Math.max(remainingAuthoredFade, 0.35);
          const initial = remainingAuthoredFade
            ? clip.volume * Math.min(1, elapsed / clip.fadeIn)
            : 0;
          loopInitialGain = initial;
          loopFadeInEnd = when + fade / this.rate;
          parameter.setValueAtTime(initial, when);
          parameter.linearRampToValueAtTime(clip.volume, loopFadeInEnd);
          source.start(when, offset);
        } else {
          const duration = clip.end - start;
          if (duration <= 0) continue;
          parameter.setValueAtTime(this.gainAt(clip, start), when);
          const points = [
            clip.start + clip.fadeIn,
            clip.end - clip.fadeOut,
            clip.fadeIn + clip.fadeOut > 0
              ? (clip.fadeIn * clip.end + clip.fadeOut * clip.start) /
                (clip.fadeIn + clip.fadeOut)
              : Number.NaN,
            clip.end,
          ]
            .filter((point) => point > start && point <= clip.end)
            .sort((a, b) => a - b);
          for (const point of [...new Set(points)])
            parameter.linearRampToValueAtTime(
              this.gainAt(clip, point),
              when + (point - start) / this.rate,
            );
          source.start(when, offset, duration);
        }
        const entry: ScheduledAudio = {
          key,
          clip,
          source,
          gain,
          when,
          retiring: false,
          ...(clip.loop
            ? {
                loopInitialGain,
                loopFadeInEnd,
                loopTransition: {
                  start: when,
                  end: loopFadeInEnd!,
                  from: loopInitialGain!,
                  to: clip.volume,
                },
              }
            : {}),
        };
        source.onended = () => this.disconnect(entry);
        this.scheduled.set(key, entry);
        this.updateLoopEnd(entry, position, now);
        continue;
      }

      const end = Math.min(this.rangeEnd, clip.end);
      if (end <= start) continue;
      const when = now + (start - position) / this.rate;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      source.loop = false;
      source.playbackRate.value = this.rate;
      source.connect(gain);
      gain.connect(this.master);
      const offset = start - clip.start;
      const parameter = gain.gain;
      parameter.cancelScheduledValues(when);
      parameter.setValueAtTime(this.gainAt(clip, start), when);
      const points = [
        clip.start + clip.fadeIn,
        end - clip.fadeOut,
        clip.fadeIn + clip.fadeOut > 0
          ? (clip.fadeIn * end + clip.fadeOut * clip.start) /
            (clip.fadeIn + clip.fadeOut)
          : Number.NaN,
        end,
      ]
        .filter((point) => point > start && point <= end)
        .sort((a, b) => a - b);
      for (const point of [...new Set(points)])
        parameter.linearRampToValueAtTime(
          this.gainAt(clip, point),
          when + (point - start) / this.rate,
        );
      // The source duration is in buffer seconds; playbackRate controls wall time.
      source.start(when, offset, end - start);
      const entry: ScheduledAudio = {
        key: `narration:${clip.id}`,
        clip,
        source,
        gain,
        when,
        retiring: false,
      };
      source.onended = () => this.disconnect(entry);
      this.scheduled.set(entry.key, entry);
    }
  }

  async play() {
    if (this.disposed) return;
    const generation = this.generation;
    const request = ++this.playRequest;
    await this.context.resume();
    if (this.context.state && this.context.state !== "running")
      throw new Error("Audio is blocked. Tap Play again to retry.");
    if (
      this.disposed ||
      generation !== this.generation ||
      request !== this.playRequest ||
      !this.timeline.total
    )
      return;
    if (this.position >= this.rangeEnd) this.cursor = this.rangeStart;
    else this.cursor = this.position;
    this.anchor = this.context.currentTime;
    this.active = true;
    this.schedule();
    if (
      this.adjacent &&
      !this.prefetchTimer &&
      !this.prefetchAbort &&
      !this.prefetched.size
    )
      this.queueAdjacentPage(this.adjacent.book, this.adjacent.pageIndex);
  }

  pause() {
    this.playRequest++;
    this.cursor = this.position;
    this.active = false;
    this.unschedule();
  }

  seek(seconds: number) {
    if (!Number.isFinite(seconds))
      throw new Error("Seek position must be finite.");
    const wasPlaying = this.active;
    this.cursor = Math.max(this.rangeStart, Math.min(this.rangeEnd, seconds));
    this.anchor = this.context.currentTime;
    this.active = wasPlaying;
    this.unschedule();
    if (wasPlaying) this.schedule();
  }

  stop() {
    this.loadAbort?.abort();
    this.prefetchAbort?.abort();
    if (this.prefetchTimer) clearTimeout(this.prefetchTimer);
    this.prefetched.clear();
    this.adjacent = undefined;
    this.generation++;
    this.playRequest++;
    this.active = false;
    this.cursor = this.rangeStart;
    this.unschedule();
  }

  speed(value: number) {
    finite(value, "Playback speed");
    const wasPlaying = this.active;
    this.cursor = this.position;
    this.anchor = this.context.currentTime;
    this.rate = value;
    this.active = wasPlaying;
    for (const entry of this.scheduled.values())
      entry.source.playbackRate.value = value;
    this.unschedule("narration");
    if (wasPlaying) this.schedule();
  }

  volume(value: number, enabled: boolean) {
    if (!Number.isFinite(value) || value < 0 || value > 1)
      throw new Error("Volume must be between 0 and 1.");
    this.master.gain.value = enabled ? value : 0;
  }

  setRange(start = 0, end = this.timeline.total) {
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end > this.timeline.total ||
      start >= end
    )
      throw new Error(
        "Playback range must be positive and inside the timeline.",
      );
    this.rangeStart = start;
    this.rangeEnd = end;
    this.cursor = start;
    this.anchor = this.context.currentTime;
    this.active = false;
    this.unschedule();
  }

  /** Stop page narration while leaving its currently audible soundtrack running through the turn. */
  preparePageTurn() {
    this.playRequest++;
    this.cursor = this.position;
    this.active = false;
    this.unschedule("narration");
  }

  /** Select a new page while retaining any soundtrack still inside its authored page range. */
  setPageRange(start: number, end: number, preserveSoundtracks: boolean) {
    if (!preserveSoundtracks) {
      this.setRange(start, end);
      return;
    }
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end > this.timeline.total ||
      start >= end
    )
      throw new Error(
        "Playback range must be positive and inside the timeline.",
      );
    this.playRequest++;
    this.rangeStart = start;
    this.rangeEnd = end;
    this.cursor = start;
    this.anchor = this.context.currentTime;
    this.active = false;
    this.unschedule("narration");
    this.reconcileSoundtracks(true);
  }

  dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.buffers.clear();
    this.sourceBook = undefined;
    this.measuredDurations = {};
    this.timeline = emptyTimeline();
    this.rangeStart = this.rangeEnd = this.cursor = 0;
    this.master.disconnect();
  }
}
