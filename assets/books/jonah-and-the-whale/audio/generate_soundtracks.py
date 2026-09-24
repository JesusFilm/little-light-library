#!/usr/bin/env python3
"""Create four quiet, periodic Jonah ambience beds from deterministic local synthesis.

Requires NumPy. No recordings, external services, or third-party audio samples are used.
Run from any directory with: python3 path/to/generate_soundtracks.py
"""
from __future__ import annotations

import hashlib
import math
import wave
from pathlib import Path

import numpy as np

SAMPLE_RATE = 24_000
SECONDS = 16
PERIOD_SAMPLES = SAMPLE_RATE * SECONDS
OUTPUT_DIR = (
    Path(__file__).resolve().parents[4]
    / "public/assets/books/jonah-and-the-whale/audio/soundtracks"
)


def periodic_noise(seed: int, low_hz: float, high_hz: float) -> np.ndarray:
    """Return deterministic band-limited noise with one exact 16 s period."""
    rng = np.random.default_rng(seed)
    white = rng.standard_normal(PERIOD_SAMPLES)
    spectrum = np.fft.rfft(white)
    frequencies = np.fft.rfftfreq(PERIOD_SAMPLES, d=1 / SAMPLE_RATE)
    low = 1 - np.exp(-np.square(np.maximum(frequencies, 0) / low_hz))
    high = np.exp(-np.square(frequencies / high_hz))
    pink = 1 / np.sqrt(np.maximum(frequencies, low_hz))
    spectrum *= low * high * pink
    noise = np.fft.irfft(spectrum, n=PERIOD_SAMPLES)
    noise -= noise.mean()
    noise /= np.sqrt(np.mean(np.square(noise)))
    return np.concatenate((noise, noise[:1]))


def periodic_tone(frequency: float, phase: float = 0) -> np.ndarray:
    """A quiet sinusoid quantized to an integer cycle count over the loop."""
    cycle = round(frequency * PERIOD_SAMPLES / SAMPLE_RATE)
    sample = np.arange(PERIOD_SAMPLES, dtype=np.float64)
    tone = np.sin(2 * math.pi * cycle * sample / PERIOD_SAMPLES + phase)
    return np.concatenate((tone, tone[:1]))


def envelope(cycles: int, phase: float = 0) -> np.ndarray:
    sample = np.arange(PERIOD_SAMPLES, dtype=np.float64)
    env = 0.72 + 0.28 * np.cos(
        2 * math.pi * cycles * sample / PERIOD_SAMPLES + phase
    )
    return np.concatenate((env, env[:1]))


def compose(
    *, seed: int, low_hz: float, high_hz: float, noise_gain: float,
    swell_cycles: int, notes: tuple[tuple[float, float], ...], target_dbfs: float,
) -> np.ndarray:
    noise = periodic_noise(seed, low_hz, high_hz)
    swell = envelope(swell_cycles, phase=0.37)
    result = noise * noise_gain * swell
    for index, (frequency, gain) in enumerate(notes):
        result += periodic_tone(frequency, phase=0.2 + index * 0.61) * gain
    result -= result.mean()
    rms = math.sqrt(float(np.mean(np.square(result))))
    target = 10 ** (target_dbfs / 20)
    result *= target / rms
    peak = float(np.max(np.abs(result)))
    if peak > 0.12:
        result *= 0.12 / peak
    return result


BEDS = (
    (
        "harbor-calm-surf.wav", 0x4A4F4E41, 45, 2_200, 0.82, 2,
        ((110, 0.13), (165, 0.055), (220, 0.025)), -34.0,
    ),
    (
        "storm-wind-and-rain.wav", 0x53544F52, 32, 3_600, 0.9, 3,
        ((55, 0.13), (82, 0.075), (110, 0.035)), -32.5,
    ),
    (
        "deep-water-prayer.wav", 0x44454550, 22, 620, 0.68, 1,
        ((65.4, 0.11), (98, 0.075), (130.8, 0.035)), -35.5,
    ),
    (
        "warm-nineveh-breeze.wav", 0x4E494E45, 75, 1_850, 0.72, 2,
        ((98, 0.10), (147, 0.07), (196, 0.035)), -35.0,
    ),
)


def write_and_measure(name: str, samples: np.ndarray) -> dict[str, float | str]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    # A duplicate final endpoint makes the wrap jump exactly zero. It adds one
    # silent-duration-equivalent sample (0.000042 s) after the 16 s loop period.
    pcm = np.clip(np.rint(samples * 32767), -32768, 32767).astype("<i2")
    pcm[-1] = pcm[0]
    output = OUTPUT_DIR / name
    with wave.open(str(output), "wb") as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(SAMPLE_RATE)
        stream.writeframes(pcm.tobytes())

    with wave.open(str(output), "rb") as stream:
        frames = np.frombuffer(stream.readframes(stream.getnframes()), dtype="<i2")
        duration = stream.getnframes() / stream.getframerate()
    normalized = frames.astype(np.float64) / 32768
    rms = math.sqrt(float(np.mean(np.square(normalized))))
    peak = float(np.max(np.abs(normalized)))
    seam = int(frames[-1]) - int(frames[0])
    differences = np.abs(np.diff(frames.astype(np.int32)))
    edge_step = int(differences[-1])
    typical_p99_step = int(np.percentile(differences, 99))
    if seam != 0:
        raise RuntimeError(f"{name}: loop endpoint mismatch ({seam} PCM steps)")
    if edge_step > 2 * typical_p99_step:
        raise RuntimeError(
            f"{name}: loop-edge step {edge_step} exceeds normal neighboring changes"
        )
    if rms > 10 ** (-30 / 20) or peak > 0.12:
        raise RuntimeError(f"{name}: source level exceeded its quiet-bed ceiling")
    return {
        "file": output.as_posix(),
        "seconds": duration,
        "sample_rate": SAMPLE_RATE,
        "channels": 1,
        "bits": 16,
        "rms_dbfs": 20 * math.log10(rms),
        "peak_dbfs": 20 * math.log10(peak),
        "loop_endpoint_delta_pcm": seam,
        "loop_edge_step_pcm": edge_step,
        "typical_p99_step_pcm": typical_p99_step,
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
    }


def main() -> None:
    print("Original locally synthesized loop beds (NumPy FFT noise; no samples):")
    for (
        name, seed, low_hz, high_hz, noise_gain, swell_cycles, notes, target_dbfs
    ) in BEDS:
        samples = compose(
            seed=seed,
            low_hz=low_hz,
            high_hz=high_hz,
            noise_gain=noise_gain,
            swell_cycles=swell_cycles,
            notes=notes,
            target_dbfs=target_dbfs,
        )
        print(write_and_measure(name, samples))


if __name__ == "__main__":
    main()
