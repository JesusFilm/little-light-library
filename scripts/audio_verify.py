#!/usr/bin/env python3
"""Check the static phrase cue pack and measured WAV onset padding."""

from array import array
import json
import hashlib
from pathlib import Path
import sys
import wave

sys.path.insert(0, str(Path(__file__).parent))
from audio_produce import CONTENT, INDEX, LOCALES, ROOT, items  # noqa: E402


def main() -> int:
    manifest = json.loads(INDEX.read_text())
    expected = set()
    onset_ms = {}
    for locale in LOCALES:
        data = json.loads((CONTENT / f"{locale}.json").read_text())
        for key, text in items(locale, data):
            expected.add(key)
            cue = manifest[key]
            expected_hash = hashlib.sha256("\0".join(("kokoro-82m-trim1", data["voice"], "1.0", text.strip())).encode()).hexdigest()[:20]
            assert cue["src"].endswith(f"-{expected_hash}.wav"), f"Stale text/voice recording: {key}"
            path = ROOT / "public" / cue["src"]
            assert path.is_file(), f"Missing {path}"
            with wave.open(str(path), "rb") as source:
                assert (source.getnchannels(), source.getsampwidth(), source.getframerate()) == (1, 2, 24_000), key
                samples = array("h")
                samples.frombytes(source.readframes(source.getnframes()))
            actual_duration = len(samples) / 24_000
            assert abs(actual_duration - cue["duration"]) < 0.00001, f"Duration differs: {key}"
            peak = max(abs(sample) for sample in samples)
            assert peak > 0, f"Silent {key}"
            threshold = max(32, peak * 0.01)
            first = next((start for start in range(0, len(samples), 240)
                          if max(abs(sample) for sample in samples[start:start + 240]) >= threshold), None)
            assert first is not None, f"No audible onset: {key}"
            onset_ms[key] = 1000 * first / 24_000
    assert set(manifest) == expected, f"Cue coverage mismatch: missing={expected - set(manifest)}, extra={set(manifest) - expected}"
    print(f"{len(expected)} cues checked across {len(LOCALES)} locales")
    for locale in LOCALES:
        phrases = sorted(key for key in onset_ms if key.startswith(locale + "/") and "/names/" not in key)
        assert len(phrases) >= 10
        distributed = [phrases[round(i * (len(phrases) - 1) / 9)] for i in range(10)]
        for speed in (0.75, 1, 1.25, 1.5):
            # At a phrase boundary, audible onset trails the clock by the
            # trimmed padding / playbackRate, with no cumulative offset.
            worst = max(onset_ms[key] / speed for key in distributed)
            print(f"{locale} {speed}x, 10 distributed phrase onsets: max {worst:.1f} ms")
            assert worst <= 200, f"Onset padding above gate at {locale} {speed}x"
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (AssertionError, KeyError, FileNotFoundError) as error:
        raise SystemExit(f"Audio verification failed: {error}") from error
