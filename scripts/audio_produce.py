#!/usr/bin/env python3
"""Render stable Kokoro WAV sources and gapless MP3 reader cues.

Run with projects/kokoro-voice-lab/.venv/bin/python; Metal access is required.
The script renders only changed text/voice pairs and writes the public index last.
"""

from __future__ import annotations

import argparse
from array import array
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import wave

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "public/content"
AUDIO = ROOT / "assets/source-recordings/audio"
RUNTIME_AUDIO = ROOT / "public/assets/audio"
INDEX = ROOT / "public/audio-manifest.json"
LOCALES = ("en-US", "en-GB", "es", "fr", "hi", "it", "ja", "pt-BR", "zh-CN")
DEFAULT_VOICES = {
    "en-US": "af_heart", "en-GB": "bf_emma", "es": "ef_dora",
    "fr": "ff_siwis", "hi": "hf_alpha", "it": "if_sara",
    "ja": "jf_alpha", "pt-BR": "pf_dora", "zh-CN": "zf_xiaoxiao",
}
VOICE_PREFIX = {
    "en-US": ("af_", "am_"), "en-GB": ("bf_", "bm_"),
    "es": ("ef_", "em_"), "fr": ("ff_",),
    "hi": ("hf_", "hm_"), "it": ("if_", "im_"),
    "ja": ("jf_", "jm_"), "pt-BR": ("pf_", "pm_"),
    "zh-CN": ("zf_", "zm_"),
}


def items(locale: str, data: dict):
    assert data["id"] == locale, f"{locale}: wrong id"
    assert len(data["stories"]) == 2, f"{locale}: expected two stories"
    assert {story["id"] for story in data["stories"]} == {"eden", "noah"}
    for story in data["stories"]:
        assert len(story["pages"]) == 8, f"{locale}/{story['id']}: expected eight pages"
        for page in story["pages"]:
            assert len(page["segments"]) >= 2, f"{locale}/{story['id']}/{page['id']}: short page"
            for segment in page["segments"]:
                key = f"{locale}/{story['id']}/{page['id']}/{segment['id']}"
                yield key, segment["text"]
    for character in ("adam", "eve", "noah"):
        yield f"{locale}/names/{character}", data["characters"][character]


def duration(path: Path) -> float:
    with wave.open(str(path), "rb") as source:
        assert source.getnchannels() == 1 and source.getframerate() == 24_000
        return source.getnframes() / source.getframerate()


def trim_silence(path: Path) -> tuple[float, float]:
    """Keep 20 ms before detected speech and 120 ms after it.

    Detection uses 10 ms windows and a relative -40 dB peak threshold. This
    removes the model's leading pad while retaining consonant attack. The
    returned values are the remaining pre/post-speech padding in seconds.
    """
    with wave.open(str(path), "rb") as source:
        channels, width, rate = source.getnchannels(), source.getsampwidth(), source.getframerate()
        frames = source.readframes(source.getnframes())
    assert (channels, width, rate) == (1, 2, 24_000), f"Unexpected WAV format: {path}"
    samples = array("h")
    samples.frombytes(frames)
    window = 240
    peak = max(abs(sample) for sample in samples)
    assert peak > 0, f"Silent recording: {path}"
    threshold = max(32, peak * 0.01)
    loud = [start for start in range(0, len(samples), window)
            if max(abs(sample) for sample in samples[start:start + window]) >= threshold]
    assert loud, f"No detected speech: {path}"
    first = max(0, loud[0] - 480)
    last = min(len(samples), loud[-1] + window + 2_880)
    kept = samples[first:last]
    with wave.open(str(path), "wb") as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(rate)
        target.writeframes(kept.tobytes())
    return (loud[0] - first) / rate, (last - loud[-1] - window) / rate


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--locale", choices=LOCALES, action="append", help="Render only selected locale(s)")
    parser.add_argument("--dry-run", action="store_true", help="Validate text and count missing clips")
    args = parser.parse_args()
    selected = args.locale or LOCALES
    jobs = []
    voices = {}
    for locale in selected:
        path = CONTENT / f"{locale}.json"
        if not path.exists():
            raise SystemExit(f"Missing locale file: {path}")
        data = json.loads(path.read_text())
        voice = data.get("voice") or DEFAULT_VOICES[locale]
        if not voice.startswith(VOICE_PREFIX[locale]):
            raise SystemExit(f"{locale}: voice {voice} is not a matching-language narrator")
        voices[locale] = voice
        for key, text in items(locale, data):
            if not isinstance(text, str) or not text.strip():
                raise SystemExit(f"Empty phrase: {key}")
            digest = hashlib.sha256("\0".join(("kokoro-82m-trim1", voice, "1.0", text.strip())).encode()).hexdigest()[:20]
            filename = f"{key.split('/')[-1]}-{digest}.wav"
            relative = Path(*key.split('/')[:-1]) / filename
            jobs.append((key, text.strip(), voice, relative))
    missing = sum(not (AUDIO / relative).exists() for _, _, _, relative in jobs)
    print(f"{len(jobs)} clips for {len(selected)} locales; {missing} require synthesis", flush=True)
    if args.dry_run:
        return 0
    from kokoro_mlx import KokoroTTS

    with KokoroTTS.from_pretrained() as tts:
        available = set(tts.list_voices())
        for locale, voice in voices.items():
            if voice not in available:
                raise SystemExit(f"{locale}: voice {voice} unavailable")
        manifest = json.loads(INDEX.read_text()) if INDEX.exists() else {}
        for ordinal, (key, text, voice, relative) in enumerate(jobs, 1):
            path = AUDIO / relative
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                temporary = path.with_suffix(".partial.wav")
                try:
                    tts.save(text, str(temporary), voice=voice, speed=1.0, sample_rate=24_000)
                    trim_silence(temporary)
                    assert duration(temporary) > 0.1, f"Empty recording: {key}"
                    temporary.replace(path)
                finally:
                    temporary.unlink(missing_ok=True)
            runtime = RUNTIME_AUDIO / relative.with_suffix(".mp3")
            if not runtime.exists():
                runtime.parent.mkdir(parents=True, exist_ok=True)
                temporary = runtime.with_suffix(".partial.mp3")
                try:
                    subprocess.run([
                        "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(path),
                        "-codec:a", "libmp3lame", "-b:a", "48k", "-ar", "24000",
                        "-ac", "1", "-write_xing", "1", str(temporary),
                    ], check=True)
                    temporary.replace(runtime)
                finally:
                    temporary.unlink(missing_ok=True)
            manifest[key] = {"src": f"assets/audio/{relative.with_suffix('.mp3').as_posix()}", "duration": round(duration(path), 6)}
            # Save each completed item so an interrupted render can resume exactly.
            INDEX.parent.mkdir(parents=True, exist_ok=True)
            INDEX.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
            print(f"{ordinal}/{len(jobs)} {key}: {manifest[key]['duration']:.2f}s", flush=True)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (AssertionError, KeyError) as error:
        raise SystemExit(f"Invalid content: {error}") from error
