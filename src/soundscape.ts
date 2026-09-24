/** Original procedural music and tactile Foley. Shares narration's audio context. */
export class Soundscape {
  private master: GainNode;
  private bed: GainNode;
  private foley: GainNode;
  private noise: AudioBuffer;
  private voices = new Map<AudioScheduledSourceNode, GainNode>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private kind: "room" | "eden" | "storm" | "hope" = "room";
  private volume = 1;
  private enabled = true;
  private hidden = false;
  private disposed = false;
  private speaking = false;
  private ambienceEnabled = true;
  private next = 0;
  private bar = 0;
  private onState = () => this.wake();
  constructor(private context: AudioContext) {
    this.master = context.createGain();
    this.bed = context.createGain();
    this.foley = context.createGain();
    this.master.gain.value = 0;
    this.bed.gain.value = 0.1;
    this.foley.gain.value = 0.22;
    this.bed.connect(this.master);
    this.foley.connect(this.master);
    this.master.connect(context.destination);
    this.noise = context.createBuffer(
      1,
      context.sampleRate * 3,
      context.sampleRate,
    );
    const data = this.noise.getChannelData(0);
    let seed = 7391;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      data[i] = (seed / 4294967296) * 2 - 1;
    }
    context.addEventListener("statechange", this.onState);
  }
  settings(volume: number, enabled: boolean) {
    this.volume = Number.isFinite(volume)
      ? Math.max(0, Math.min(1, volume))
      : 0;
    this.enabled = enabled;
    this.mix();
    this.wake();
  }
  /** Call with narration.clock.playing. Safe to call on every render frame. */
  narration(active: boolean) {
    if (this.disposed || this.speaking === active) return;
    this.speaking = active;
    this.bed.gain.setTargetAtTime(
      this.ambienceEnabled ? (active ? 0.032 : 0.1) : 0,
      this.context.currentTime,
      0.18,
    );
    this.foley.gain.setTargetAtTime(
      active ? 0.12 : 0.22,
      this.context.currentTime,
      0.08,
    );
  }
  /** Authored books supply their own music while retaining the shared paper sounds. */
  ambience(enabled: boolean) {
    this.ambienceEnabled = enabled;
    this.bed.gain.setTargetAtTime(
      enabled ? (this.speaking ? 0.032 : 0.1) : 0,
      this.context.currentTime,
      0.06,
    );
  }
  scene(kind: "room" | "eden" | "storm" | "hope") {
    if (this.disposed) return;
    if (kind !== this.kind) {
      this.kind = kind;
      this.stop();
      this.bar = 0;
      this.next = this.context.currentTime + 0.12;
    }
    this.mix();
    this.wake();
  }
  cue(kind: "open" | "page" | "close" | "figure" | "tap") {
    if (this.disposed || this.hidden || !this.enabled || !this.volume) return;
    const t = this.context.currentTime + 0.008;
    if (kind === "page") {
      this.rustle(t, 0.38, 1500, 0.5, this.foley);
      this.rustle(t + 0.26, 0.11, 620, 0.28, this.foley);
    } else if (kind === "open" || kind === "close") {
      this.tone(t, 94, 0.25, 0.45, this.foley);
      this.rustle(
        t + 0.04,
        kind === "open" ? 0.55 : 0.19,
        650,
        0.45,
        this.foley,
      );
      if (kind === "open")
        [293.66, 440, 587.33].forEach((hz, i) =>
          this.tone(t + 0.13 + i * 0.09, hz, 1.1, 0.22, this.foley),
        );
    } else if (kind === "figure") {
      this.tone(t, 160, 0.12, 0.28, this.foley);
      [659.25, 880, 987.77].forEach((hz, i) =>
        this.tone(t + i * 0.085, hz, 0.65, 0.22, this.foley),
      );
    } else this.tone(t, 440, 0.09, 0.23, this.foley);
    this.wake();
  }
  pause(hidden: boolean) {
    if (this.disposed) return;
    this.hidden = hidden;
    this.mix();
    this.wake();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.context.removeEventListener("statechange", this.onState);
    this.stop();
    for (const [voice, gain] of this.voices) {
      voice.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
    this.bed.disconnect();
    this.foley.disconnect();
    this.master.disconnect();
  }
  private mix() {
    if (!this.disposed)
      this.master.gain.setTargetAtTime(
        this.enabled && !this.hidden ? this.volume : 0,
        this.context.currentTime,
        0.06,
      );
  }
  private wake() {
    if (
      this.disposed ||
      this.hidden ||
      !this.enabled ||
      !this.volume ||
      this.context.state !== "running"
    ) {
      this.stop();
      return;
    }
    if (this.timer !== undefined) return;
    this.next = Math.max(this.next, this.context.currentTime + 0.04);
    this.tick();
    this.timer = setInterval(() => this.tick(), 300);
  }
  private stop() {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    this.clearVoices();
    this.next = this.context.currentTime + 0.04;
  }
  private clearVoices() {
    for (const [voice, gain] of this.voices) {
      gain.gain.cancelScheduledValues(this.context.currentTime);
      gain.gain.setTargetAtTime(0, this.context.currentTime, 0.012);
      try {
        voice.stop(this.context.currentTime + 0.06);
      } catch {
        /* Already ended. */
      }
    }
  }
  private tick() {
    if (this.context.state !== "running") {
      this.stop();
      return;
    }
    if (this.next < this.context.currentTime)
      this.next = this.context.currentTime + 0.04;
    while (this.next < this.context.currentTime + 1.2) {
      const t = this.next;
      const storm = this.kind === "storm";
      const roots = storm
        ? [146.83, 130.81, 146.83, 110]
        : [146.83, 174.61, 130.81, 146.83];
      const root = roots[this.bar % 4];
      this.tone(t, root, 5.4, 0.32, this.bed, 0.8);
      this.tone(t + 0.35, root * 1.5, 5, 0.17, this.bed, 0.9);
      if (!storm) {
        this.tone(
          t + 0.8,
          root * [2, 3, 2.667, 2.25][this.bar % 4],
          2.4,
          0.28,
          this.bed,
        );
        this.tone(t + 2.6, root * 2, 2.8, 0.18, this.bed);
      }
      if (this.kind === "eden") {
        this.rustle(t, 5.9, 1100, 0.06, this.bed);
        this.bird(t + 1.8, 1900 + (this.bar % 3) * 170);
      } else if (storm) {
        this.rustle(t, 6.2, 420, 0.85, this.bed);
        this.rustle(t + 1.1, 4, 110, 1.15, this.bed);
      } else if (this.kind === "hope") {
        this.bird(t + 3.5, 2200);
        this.tone(t + 1.5, root * 4, 3.2, 0.13, this.bed);
      }
      this.bar++;
      this.next += 6;
    }
  }
  private track(
    source: AudioScheduledSourceNode,
    gain: GainNode,
    nodes: AudioNode[] = [],
  ) {
    this.voices.set(source, gain);
    source.onended = () => {
      this.voices.delete(source);
      source.disconnect();
      gain.disconnect();
      nodes.forEach((node) => node.disconnect());
    };
  }
  private tone(
    t: number,
    hz: number,
    duration: number,
    level: number,
    bus: GainNode,
    attack = 0.012,
  ) {
    const osc = this.context.createOscillator(),
      gain = this.context.createGain();
    osc.type = "sine";
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(bus);
    this.track(osc, gain);
    osc.start(t);
    osc.stop(t + duration + 0.015);
  }
  private rustle(
    t: number,
    duration: number,
    frequency: number,
    level: number,
    bus: GainNode,
  ) {
    const source = this.context.createBufferSource(),
      filter = this.context.createBiquadFilter(),
      gain = this.context.createGain();
    source.buffer = this.noise;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(frequency, t);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(60, frequency * 0.35),
      t + duration,
    );
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(
      level,
      t + Math.min(0.12, duration * 0.25),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(bus);
    this.track(source, gain, [filter]);
    source.start(t);
    source.stop(t + duration + 0.02);
  }
  private bird(t: number, hz: number) {
    const osc = this.context.createOscillator(),
      gain = this.context.createGain();
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 1.35, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.9, t + 0.2);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.065, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(this.bed);
    this.track(osc, gain);
    osc.start(t);
    osc.stop(t + 0.24);
  }
}
