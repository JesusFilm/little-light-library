import { test } from "node:test";
import assert from "node:assert/strict";
import { readPreferences, savePreferences } from "../src/preferences.ts";
import { ReaderState } from "../src/state.ts";
test("first startup defaults and persisted settings survive restart", () => {
  const storage = {
    value: null as string | null,
    getItem() {
      return this.value;
    },
    setItem(_k: string, v: string) {
      this.value = v;
    },
  };
  assert.deepEqual(readPreferences(storage), {
    language: "en-US",
    speed: 1,
    audio: true,
    volume: 0.8,
  });
  savePreferences(storage, {
    language: "ja",
    speed: 1.5,
    audio: false,
    volume: 0.3,
  });
  assert.equal(readPreferences(storage).language, "ja");
  assert.equal(readPreferences(storage).speed, 1.5);
  storage.value = '{"language":"xx","speed":99,"volume":-2}';
  assert.equal(readPreferences(storage).language, "en-US");
  assert.equal(readPreferences(storage).volume, 0.8);
});
test("language preserves book and page, resets playback paused; hidden requires explicit resume", () => {
  const s = new ReaderState();
  s.open("noah");
  s.turn(4);
  s.play();
  s.changeLanguage("ja");
  assert.equal(s.book, "noah");
  assert.equal(s.page, 4);
  assert.equal(s.playing, false);
  assert.equal(s.revision, 3);
  s.play();
  s.hide();
  assert.equal(s.playing, false);
  s.close();
  assert.equal(s.book, null);
});
