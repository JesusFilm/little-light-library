import assert from "node:assert/strict";
import test from "node:test";
import { ShelfToyAudio } from "../src/shelf-toy-audio";

function fixture() {
  const sources: {
    started: boolean;
    stopped: boolean;
    start(): void;
    stop(): void;
  }[] = [];
  const gain = { gain: { value: 0 }, connect() {} };
  const context = {
    destination: {},
    resume: async () => {},
    createGain: () => gain,
    decodeAudioData: async () => ({}),
    createBufferSource() {
      const source = {
        started: false,
        stopped: false,
        connect() {},
        disconnect() {},
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        },
      };
      sources.push(source);
      return source;
    },
  } as unknown as AudioContext;
  return { audio: new ShelfToyAudio(context), gain, sources };
}

test("toy effect respects mute and volume independently of narration", async () => {
  const { audio, gain, sources } = fixture();
  audio.settings(0.3, false);
  await audio.play("data:audio/wav;base64,AAAA");
  assert.equal(sources.length, 0);
  audio.settings(0.3, true);
  await audio.play("data:audio/wav;base64,AAAA");
  assert.equal(gain.gain.value, 0.3);
  assert.equal(audio.playing, true);
  audio.settings(0.8, false);
  assert.equal(audio.playing, false);
  assert.equal(sources[0].stopped, true);
});

test("leaving a book prevents a pending sound from starting later", async () => {
  const { audio, sources } = fixture();
  const pending = audio.play("data:audio/wav;base64,AAAA");
  audio.stop();
  await pending;
  assert.equal(sources.length, 0);
  assert.equal(audio.playing, false);
});

test("rapid clicks keep only the latest effect and stop its predecessor", async () => {
  const { audio, sources } = fixture();
  await audio.play("data:audio/wav;base64,AAAA");
  const first = audio.play("data:audio/wav;base64,AAAA");
  const second = audio.play("data:audio/wav;base64,AAAA");
  await Promise.all([first, second]);
  assert.equal(sources.length, 2);
  assert.equal(sources[0].stopped, true);
  assert.equal(sources[1].started, true);
});
