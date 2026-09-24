/** AudioContext time is the only running time source. Durations are decoded recordings. */
export class PlaybackClock {
  private cursor = 0;
  private anchor = 0;
  private active = false;
  durations: number[] = [];
  speed = 1;
  constructor(private now: () => number) {}
  get total() {
    return this.durations.reduce((a, b) => a + b, 0);
  }
  get position() {
    return Math.min(
      this.total,
      this.cursor + (this.active ? (this.now() - this.anchor) * this.speed : 0),
    );
  }
  get ended() {
    return this.total > 0 && this.position >= this.total;
  }
  get playing() {
    return this.active && !this.ended;
  }
  get segment() {
    let end = 0;
    for (let i = 0; i < this.durations.length; i++) {
      end += this.durations[i];
      if (this.position < end) return i;
    }
    return Math.max(0, this.durations.length - 1);
  }
  load(durations: number[]) {
    this.pause();
    this.durations = durations;
    this.cursor = 0;
  }
  play() {
    if (this.ended) this.cursor = 0;
    this.anchor = this.now();
    this.active = true;
  }
  pause() {
    this.cursor = this.position;
    this.active = false;
  }
  replay() {
    this.cursor = 0;
    this.anchor = this.now();
    this.active = true;
  }
  setSpeed(speed: number) {
    const was = this.playing;
    this.pause();
    this.speed = speed;
    if (was) this.play();
  }
}
