import { PlaybackClock } from "./clock";
import type { AudioCue } from "./contracts";
export class Narration {
  readonly context: AudioContext;
  readonly clock: PlaybackClock;
  private gain: GainNode;
  private buffers: AudioBuffer[] = [];
  private sources: AudioBufferSourceNode[] = [];
  private generation = 0;
  private playRequest = 0;
  constructor(context = new AudioContext()) {
    this.context = context;
    this.clock = new PlaybackClock(() => this.context.currentTime);
    this.gain = context.createGain();
    this.gain.connect(this.context.destination);
  }
  async unlock() {
    await this.context.resume();
  }
  async load(cues: AudioCue[]) {
    this.stop();
    const generation = this.generation;
    const buffers = await Promise.all(
      cues.map(async (cue) => {
        if (!cue) throw new Error("missing audio");
        const response = await fetch(cue.src);
        if (!response.ok) throw new Error("missing audio");
        return this.context.decodeAudioData(await response.arrayBuffer());
      }),
    );
    if (generation !== this.generation) return false;
    this.buffers = buffers;
    this.clock.load(buffers.map((b) => b.duration));
    return true;
  }
  private unschedule() {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
      source.disconnect();
    }
    this.sources = [];
  }
  private schedule() {
    this.unschedule();
    let offset = 0;
    const position = this.clock.position;
    const now = this.context.currentTime;
    for (const buffer of this.buffers) {
      const end = offset + buffer.duration;
      if (end > position) {
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = this.clock.speed;
        source.connect(this.gain);
        source.start(
          now + Math.max(0, offset - position) / this.clock.speed,
          Math.max(0, position - offset),
        );
        this.sources.push(source);
      }
      offset = end;
    }
  }
  async play() {
    const generation = this.generation;
    const request = ++this.playRequest;
    await this.unlock();
    if (
      generation !== this.generation ||
      request !== this.playRequest ||
      !this.buffers.length
    )
      return;
    this.clock.play();
    this.schedule();
  }
  pause() {
    this.playRequest++;
    this.clock.pause();
    this.unschedule();
  }
  async replay() {
    this.pause();
    this.clock.load(this.buffers.map((b) => b.duration));
    await this.play();
  }
  stop() {
    this.generation++;
    this.pause();
    this.buffers = [];
    this.clock.load([]);
  }
  speed(value: number) {
    const was = this.clock.playing;
    this.clock.setSpeed(value);
    if (was) this.schedule();
  }
  volume(volume: number, enabled: boolean) {
    this.gain.gain.value = enabled ? volume : 0;
  }
}
