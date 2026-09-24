/** Click effects share the reader's audio context and never interrupt its saved position. */
export class ShelfToyAudio {
  private gain: GainNode;
  private source?: AudioBufferSourceNode;
  private revision = 0;
  private enabled = true;
  private buffers = new Map<string, Promise<AudioBuffer>>();
  constructor(private context: AudioContext) {
    this.gain = context.createGain();
    this.gain.connect(context.destination);
  }
  settings(volume: number, enabled: boolean) {
    this.enabled = enabled;
    this.gain.gain.value = enabled ? Math.max(0, Math.min(1, volume)) : 0;
    if (!enabled) this.stop();
  }
  stop() {
    this.revision++;
    if (this.source) {
      this.source.onended = null;
      this.source.stop();
      this.source.disconnect();
      this.source = undefined;
    }
  }
  async play(url: string) {
    this.stop();
    if (!this.enabled) return;
    const revision = this.revision;
    await this.context.resume();
    if (revision !== this.revision || !this.enabled) return;
    let buffer = this.buffers.get(url);
    if (!buffer) {
      buffer = fetch(url).then(async (response) => {
        if (!response.ok) throw Error(`Audio HTTP ${response.status}`);
        return this.context.decodeAudioData(await response.arrayBuffer());
      });
      this.buffers.set(url, buffer);
      if (this.buffers.size > 12)
        this.buffers.delete(this.buffers.keys().next().value!);
    }
    let decoded: AudioBuffer;
    try {
      decoded = await buffer;
    } catch (error) {
      this.buffers.delete(url);
      if (revision !== this.revision || !this.enabled) return;
      throw error;
    }
    if (revision !== this.revision || !this.enabled) return;
    const source = this.context.createBufferSource();
    source.buffer = decoded;
    source.connect(this.gain);
    source.onended = () => {
      source.disconnect();
      if (this.source === source) this.source = undefined;
    };
    this.source = source;
    source.start();
  }
  get playing() {
    return Boolean(this.source);
  }
}
