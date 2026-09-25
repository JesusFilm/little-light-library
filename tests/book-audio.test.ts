import assert from "node:assert/strict";
import test from "node:test";
import { BookAudio, buildBookTimeline } from "../src/book-audio";
import type { AuthoredBook } from "../src/authored-book";

function book(): AuthoredBook {
  return {
    format: "little-light-book",
    version: 1,
    id: "audio-test",
    title: "Audio test",
    subtitle: "A test",
    locale: "en-US",
    status: "draft",
    source: "Test source",
    retellingNote: "Test retelling",
    cover: "picture",
    assets: {
      picture: { kind: "image", src: "art/picture.png", attribution: "Test" },
      first: { kind: "audio", src: "audio/first.wav", attribution: "Test" },
      second: { kind: "audio", src: "audio/second.wav", attribution: "Test" },
      music: { kind: "audio", src: "audio/music.mp3", attribution: "Test" },
    },
    spreads: [
      {
        id: "one",
        title: "One",
        source: "Test",
        stagingNote: "Test",
        seconds: 8,
        backdrop: { asset: "picture" },
        elements: [],
        segments: [
          {
            id: "first",
            text: "First line.",
            narration: {
              asset: "first",
              recordedText: "First line.",
              duration: 2,
              voice: "Test",
            },
          },
        ],
      },
      {
        id: "two",
        title: "Two",
        source: "Test",
        stagingNote: "Test",
        seconds: 2,
        backdrop: { asset: "picture" },
        elements: [],
        segments: [
          {
            id: "second",
            text: "Second line.",
            narration: {
              asset: "second",
              recordedText: "Second line.",
              duration: 3,
              voice: "Test",
            },
          },
        ],
      },
    ],
    narrationVolume: 0.75,
    soundtracks: [
      {
        id: "theme",
        label: "Theme",
        asset: "music",
        startPage: "one",
        endPage: "two",
        startOffset: 1,
        endOffset: 1,
        volume: 0.4,
        fadeIn: 2,
        fadeOut: 1,
        loop: false,
      },
    ],
  };
}

test("timeline uses measured narration, page minima, inclusive soundtrack ranges and natural ends", () => {
  const timeline = buildBookTimeline(book(), {
    first: 2.5,
    second: 3.5,
    music: 4,
  });
  assert.deepEqual(timeline.pages, [
    {
      id: "one",
      index: 0,
      start: 0,
      end: 8,
      duration: 8,
      segmentDurations: [2.5],
    },
    {
      id: "two",
      index: 1,
      start: 8,
      end: 11.5,
      duration: 3.5,
      segmentDurations: [3.5],
    },
  ]);
  assert.equal(timeline.total, 11.5);
  assert.deepEqual(
    timeline.clips.map(({ id, kind, start, end, volume, loop }) => ({
      id,
      kind,
      start,
      end,
      volume,
      loop,
    })),
    [
      {
        id: "one:first",
        kind: "narration",
        start: 0,
        end: 2.5,
        volume: 0.75,
        loop: false,
      },
      {
        id: "two:second",
        kind: "narration",
        start: 8,
        end: 11.5,
        volume: 0.75,
        loop: false,
      },
      {
        id: "theme",
        kind: "soundtrack",
        start: 1,
        end: 5,
        volume: 0.4,
        loop: false,
      },
    ],
  );
});

test("one missing or stale narration suppresses the whole page but preserves phrase timing", () => {
  const fixture = book();
  fixture.spreads[0].segments.push({ id: "silent", text: "No recording." });
  fixture.spreads[1].segments[0].narration!.recordedText = "Old words.";
  const timeline = buildBookTimeline(fixture, { first: 2.25, second: 3.25 });
  assert.deepEqual(timeline.pages[0].segmentDurations, [2.25, 0]);
  assert.deepEqual(timeline.pages[1].segmentDurations, [3.25]);
  assert.equal(
    timeline.clips.filter((clip) => clip.kind === "narration").length,
    0,
  );
});

test("looped soundtracks fill their trimmed page range and invalid timing throws", () => {
  const fixture = book();
  fixture.soundtracks![0].loop = true;
  const timeline = buildBookTimeline(fixture, { music: 0.5 });
  const theme = timeline.clips.find((clip) => clip.id === "theme")!;
  assert.deepEqual([theme.start, theme.end], [1, 10]);

  fixture.soundtracks![0].startOffset = 20;
  assert.throws(() => buildBookTimeline(fixture), /no playable time/);
  fixture.soundtracks![0].startOffset = -1;
  assert.throws(() => buildBookTimeline(fixture), /non-negative/);
});

type FakeParameter = {
  value: number;
  events: Array<[string, number, number?]>;
  cancelScheduledValues(time: number): void;
  setValueAtTime(value: number, time: number): void;
  linearRampToValueAtTime(value: number, time: number): void;
};

function fakeContext(durations = [2, 3, 4, 5]) {
  let currentTime = 0;
  const sources: Array<{
    buffer?: { duration: number };
    loop: boolean;
    playbackRate: { value: number };
    stopped: boolean;
    stopCalls: Array<number | undefined>;
    onended?: (() => void) | null;
    disconnected: boolean;
    when?: number;
    offset?: number;
    duration?: number;
    connect(node: unknown): unknown;
    disconnect(): void;
    stop(when?: number): void;
    start(when: number, offset: number, duration?: number): void;
  }> = [];
  const gains: Array<{
    gain: FakeParameter;
    connect(node: unknown): unknown;
    disconnect(): void;
  }> = [];
  let decodeIndex = 0;
  const parameter = (): FakeParameter => ({
    value: 1,
    events: [],
    cancelScheduledValues(time) {
      this.events.push(["cancel", time]);
    },
    setValueAtTime(value, time) {
      this.events.push(["set", time, value]);
    },
    linearRampToValueAtTime(value, time) {
      this.events.push(["ramp", time, value]);
    },
  });
  const context = {
    get currentTime() {
      return currentTime;
    },
    set currentTime(value: number) {
      currentTime = value;
    },
    destination: {},
    resume: async () => {},
    createGain() {
      const gain = {
        gain: parameter(),
        connect: (node: unknown) => node,
        disconnect() {},
      };
      gains.push(gain);
      return gain;
    },
    createBufferSource() {
      const source = {
        loop: false,
        playbackRate: { value: 1 },
        stopped: false,
        stopCalls: [] as Array<number | undefined>,
        onended: null as (() => void) | null,
        disconnected: false,
        connect: (node: unknown) => node,
        disconnect() {
          this.disconnected = true;
        },
        stop(when?: number) {
          this.stopCalls.push(when);
          if (when === undefined || when <= currentTime) this.stopped = true;
        },
        start(when: number, offset: number, duration?: number) {
          Object.assign(this, { when, offset, duration });
        },
      };
      sources.push(source);
      return source;
    },
    async decodeAudioData() {
      return { duration: durations[decodeIndex++] ?? 4 };
    },
  };
  return { context, sources, gains };
}

async function withFetch(run: () => Promise<void>) {
  const original = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return {
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(1),
    } as Response;
  };
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
  return urls;
}

test("phone reader fetches only the selected page and its soundtrack", async () => {
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  const fixture = book();
  const first = await withFetch(async () => {
    assert.equal(await player.load(fixture, 0), true);
  });
  assert.deepEqual(first, ["./audio/first.wav", "./audio/music.mp3"]);
  const second = await withFetch(async () => {
    assert.equal(await player.loadPage(fixture, 1), true);
  });
  assert.deepEqual(second, ["./audio/second.wav"]);
  const page = player.timeline.pages[1];
  player.setPageRange(page.start, page.end, true);
  await player.play();
  assert.ok(fake.sources.some((source) => source.buffer));
  player.preparePageTurn();
  const back = await withFetch(async () => {
    assert.equal(await player.loadPage(fixture, 0), true);
  });
  assert.deepEqual(back, ["./audio/first.wav", "./audio/music.mp3"]);
});

test("player loads serial assets and schedules bounded clips with fades and master volume", async () => {
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  const urls = await withFetch(async () => {
    assert.equal(await player.load(book()), true);
    player.setRange(0, 2);
    player.seek(0.5);
    player.volume(0.6, true);
    await player.play();
  });
  assert.deepEqual(urls, [
    "./audio/first.wav",
    "./audio/second.wav",
    "./audio/music.mp3",
  ]);
  assert.equal(fake.gains[0].gain.value, 0.6);
  assert.equal(fake.sources.length, 2);
  assert.deepEqual(
    fake.sources.map(({ when, offset, duration, loop, playbackRate }) => ({
      when,
      offset,
      duration,
      loop,
      rate: playbackRate.value,
    })),
    [
      { when: 0, offset: 0.5, duration: 1.5, loop: false, rate: 1 },
      { when: 0.5, offset: 0, duration: 4, loop: false, rate: 1 },
    ],
  );
  const soundtrackGain = fake.gains[2].gain.events;
  assert.deepEqual(soundtrackGain.slice(0, 2), [
    ["cancel", 0.5],
    ["set", 0.5, 0],
  ]);
});

test("resume midway through a fade, seek and speed reschedule from content time", async () => {
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => player.load(book()).then(() => undefined));
  player.seek(1.5);
  await player.play();
  const soundtrack = fake.sources[2];
  assert.equal(soundtrack.offset, 0.5);
  assert.deepEqual(fake.gains[3].gain.events.slice(0, 2), [
    ["cancel", 0],
    ["set", 0, 0.1],
  ]);

  fake.context.currentTime = 0.5;
  assert.equal(player.position, 2);
  player.speed(2);
  assert.ok(fake.sources[0].stopped && fake.sources[1].stopped);
  assert.equal(soundtrack.playbackRate.value, 2);
  const remainingCue = fake.sources.find(
    (source) => source.offset === 0 && source.when === 3.5,
  );
  assert.ok(
    remainingCue,
    "the next narration cue is scheduled at the new rate",
  );
  assert.equal(remainingCue.duration, 3);
  assert.equal(
    remainingCue.playbackRate.value,
    2,
    "the full three-second buffer cue plays at double speed instead of being truncated",
  );
  player.seek(4);
  assert.equal(player.position, 4);
  player.pause();
  assert.equal(player.playing, false);
});

test("Play restarts the current page after its authored timeline ends", async () => {
  const fixture = book();
  fixture.soundtracks = [];
  const fake = fakeContext([2, 3]);
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => {
    assert.equal(await player.load(fixture), true);
  });
  const page = player.timeline.pages[0];
  player.setPageRange(page.start, page.end, false);
  await player.play();

  fake.context.currentTime = page.end;
  assert.equal(player.playing, false);
  await player.play();
  assert.equal(player.position, page.start);
  assert.equal(player.playing, true);
  player.pause();
  player.dispose();
});

test("looping beds outlive a page clock and keep the same source across covered pages", async () => {
  const fixture = book();
  fixture.spreads.push({
    ...fixture.spreads[1],
    id: "three",
    title: "Three",
  });
  fixture.soundtracks![0].loop = true;
  fixture.soundtracks![0].endPage = "three";
  fixture.soundtracks![0].endOffset = 0;
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => {
    assert.equal(await player.load(fixture), true);
    const [first, second, third] = player.timeline.pages;
    player.setPageRange(first.start, first.end, false);
    await player.play();

    const bed = fake.sources.find((source) => source.loop)!;
    assert.ok(bed, "the authored bed starts on its first page");
    assert.equal(
      bed.duration,
      undefined,
      "a loop has no nominal wall-time stop",
    );
    fake.context.currentTime = 40;
    assert.equal(player.position, first.end);
    assert.equal(
      player.playing,
      true,
      "the bed remains audible after page time ends",
    );
    assert.equal(bed.stopped, false);

    player.preparePageTurn();
    player.setPageRange(second.start, second.end, true);
    await player.play();
    assert.equal(fake.sources.filter((source) => source.loop).length, 1);
    assert.equal(
      fake.sources.find((source) => source.loop),
      bed,
    );
    fake.context.currentTime = 100;
    assert.equal(
      player.playing,
      true,
      "the bed follows the authored range, not elapsed page seconds",
    );

    player.preparePageTurn();
    player.setPageRange(third.start, third.end, true);
    await player.play();
    fake.context.currentTime = 200;
    assert.equal(
      player.playing,
      true,
      "a zero-offset loop stays audible while a child lingers on its final included page",
    );
    assert.equal(
      fake.sources.find((source) => source.loop),
      bed,
    );

    player.pause();
    assert.equal(bed.stopped, true, "explicit pause stops the retained bed");
    assert.equal(player.playing, false);
  });
});

test("a looping bed fades at its trimmed end on the final included page and revives on a back turn", async () => {
  const fixture = book();
  fixture.soundtracks![0].loop = true;
  fixture.soundtracks![0].endOffset = 1;
  fixture.soundtracks![0].fadeOut = 0.6;
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => {
    assert.equal(await player.load(fixture), true);
    const [first, last] = player.timeline.pages;
    const bedClip = player.timeline.clips.find((clip) => clip.id === "theme")!;
    player.setPageRange(first.start, first.end, false);
    await player.play();
    const bed = fake.sources.find((source) => source.loop)!;
    assert.equal(
      bed.stopCalls.length,
      0,
      "the final-page fade is not scheduled on an earlier included page",
    );

    player.preparePageTurn();
    player.setPageRange(last.start, last.end, true);
    await player.play();
    const endAt = fake.context.currentTime + (bedClip.end - last.start);
    assert.ok(
      fake.gains[2].gain.events.some(
        ([kind, time, value]) =>
          kind === "ramp" && Math.abs(time - endAt) < 1e-8 && value === 0,
      ),
      "the looping bed fades to silence at its endOffset within the last page",
    );
    assert.equal(
      bed.stopCalls.length,
      0,
      "the loop is stopped after its audio-clock fade",
    );

    fake.context.currentTime = endAt - 0.2;
    player.preparePageTurn();
    player.setPageRange(first.start, first.end, true);
    await player.play();
    assert.equal(
      fake.sources.filter((source) => source.loop).length,
      1,
      "turning back before the endpoint retains the same loop source",
    );
    assert.ok(
      fake.gains[2].gain.events.some(
        ([kind, time]) => kind === "ramp" && time > fake.context.currentTime,
      ),
      "the fading bed recovers smoothly when leaving its final page",
    );
    player.pause();
  });
});

test("changed beds crossfade, rapid return remains stoppable, and pause releases every source", async () => {
  const fixture = book();
  fixture.assets.newMusic = {
    kind: "audio",
    src: "audio/new-music.mp3",
    attribution: "Test",
  };
  fixture.soundtracks = [
    {
      ...fixture.soundtracks![0],
      id: "first-bed",
      startPage: "one",
      endPage: "one",
      startOffset: 0,
      endOffset: 0,
      fadeIn: 0,
      fadeOut: 0.8,
      loop: true,
    },
    {
      ...fixture.soundtracks![0],
      id: "second-bed",
      label: "Second bed",
      asset: "newMusic",
      volume: 0.3,
      startPage: "two",
      endPage: "two",
      startOffset: 0,
      endOffset: 0,
      fadeIn: 0,
      fadeOut: 0.5,
      loop: true,
    },
  ];
  const fake = fakeContext([2, 3, 4, 5]);
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => {
    assert.equal(await player.load(fixture), true);
    const [first, second] = player.timeline.pages;
    player.setPageRange(first.start, first.end, false);
    await player.play();
    const firstBed = fake.sources.find((source) => source.loop)!;
    fake.context.currentTime = 0.4;

    player.preparePageTurn();
    player.setPageRange(second.start, second.end, true);
    assert.ok(
      firstBed.stopCalls.some(
        (when) => when !== undefined && Math.abs(when - 1.2) < 1e-8,
      ),
      "the outgoing bed fades to silence",
    );
    assert.equal(
      firstBed.stopped,
      false,
      "a scheduled crossfade keeps the outgoing source alive until its fade ends",
    );
    await player.play();
    const secondBed = fake.sources.find(
      (source) => source.loop && source.buffer?.duration === 5,
    )!;
    assert.ok(secondBed, "the next bed begins on its authored page");
    const secondGain = fake.gains.at(-1)!.gain.events;
    assert.ok(
      secondGain.some(
        ([kind, time, value]) =>
          kind === "ramp" && time === 0.75 && value === 0.3,
      ),
      "a new layer fades in even when its authored fade is zero",
    );

    player.preparePageTurn();
    player.setPageRange(first.start, first.end, true);
    await player.play();
    const returnedBed = fake.sources.filter((source) => source.loop).at(-1)!;
    assert.notEqual(
      returnedBed,
      firstBed,
      "rapid return starts a fresh non-retiring source",
    );
    player.pause();
    assert.ok(fake.sources.every((source) => source.stopped));
    assert.ok(
      firstBed.stopCalls.includes(undefined),
      "Pause force-stops a source even when it is already retiring",
    );
    assert.equal(player.playing, false);
  });
});

test("pause and stop invalidate late resume and load completions", async () => {
  const fake = fakeContext();
  const player = new BookAudio(fake.context as unknown as AudioContext);
  await withFetch(async () => player.load(book()).then(() => undefined));
  let releaseResume!: () => void;
  fake.context.resume = () =>
    new Promise<void>((resolve) => (releaseResume = resolve));
  const pendingPlay = player.play();
  player.pause();
  releaseResume();
  await pendingPlay;
  assert.equal(fake.sources.length, 0);

  let releaseFetch!: () => void;
  const original = globalThis.fetch;
  globalThis.fetch = () =>
    new Promise<Response>((resolve) => {
      releaseFetch = () =>
        resolve({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1),
        } as Response);
    });
  try {
    const pendingLoad = player.load(book());
    player.stop();
    releaseFetch();
    assert.equal(await pendingLoad, false);
    assert.equal(player.timeline.total, 0);
  } finally {
    globalThis.fetch = original;
  }
});
