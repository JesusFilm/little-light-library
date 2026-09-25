import { test } from "node:test";
import assert from "node:assert/strict";
import { Narration } from "../src/playback.ts";
function fixture() {
  const sources: any[] = [];
  const gain = { gain: { value: 1 }, connect() {} };
  const context = {
    currentTime: 0,
    destination: {},
    createGain: () => gain,
    resume: async () => {},
    decodeAudioData: async () => ({ duration: 2 }),
    createBufferSource: () => {
      const source = {
        playbackRate: { value: 1 },
        connect() {},
        disconnect() {},
        stopped: false,
        stop() {
          this.stopped = true;
        },
        start(when: number, offset: number) {
          Object.assign(this, { when, offset });
        },
      };
      sources.push(source);
      return source;
    },
  };
  return { sources, gain, context };
}
test("WebAudio scheduling, mute, rate change and pause share one timeline", async () => {
  const f = fixture();
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }) as Response;
  try {
    const n = new Narration(f.context as unknown as AudioContext);
    await n.load([
      { src: "a", duration: 2 },
      { src: "b", duration: 2 },
    ]);
    await n.play();
    assert.equal(f.sources[0].when, 0);
    assert.equal(f.sources[1].when, 2);
    f.context.currentTime = 0.5;
    n.volume(0.8, false);
    assert.equal(f.gain.gain.value, 0);
    assert.equal(n.clock.position, 0.5);
    n.speed(1.5);
    assert.ok(f.sources[0].stopped);
    assert.equal(f.sources[2].offset, 0.5);
    assert.equal(f.sources[3].when, 1.5);
    n.pause();
    assert.ok(f.sources.every((s) => s.stopped));
  } finally {
    globalThis.fetch = original;
  }
});
test("late audio-unlock cannot restart sources after stop or a language change", async () => {
  const f = fixture();
  let resume!: () => void;
  f.context.resume = () => new Promise<void>((r) => (resume = r));
  const n = new Narration(f.context as unknown as AudioContext);
  const play = n.play();
  n.stop();
  resume();
  await play;
  assert.equal(n.clock.playing, false);
  assert.equal(f.sources.length, 0);
});

test("tab-hide pause cancels a pending audio unlock", async () => {
  const f = fixture();
  let resolve!: () => void;
  f.context.resume = () => new Promise<void>((r) => (resolve = r));
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }) as Response;
  try {
    const n = new Narration(f.context as unknown as AudioContext);
    await n.load([{ src: "a", duration: 2 }]);
    const play = n.play();
    n.pause();
    resolve();
    await play;
    assert.equal(n.clock.playing, false);
    assert.equal(f.sources.length, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("turning away aborts a pending legacy narration download", async () => {
  const f = fixture();
  const original = globalThis.fetch;
  let aborted = false;
  globalThis.fetch = (_url, options) =>
    new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => {
        aborted = true;
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  try {
    const n = new Narration(f.context as unknown as AudioContext);
    const pending = n.load([{ src: "a", duration: 2 }]);
    n.stop();
    assert.equal(await pending, false);
    assert.equal(aborted, true);
  } finally {
    globalThis.fetch = original;
  }
});
