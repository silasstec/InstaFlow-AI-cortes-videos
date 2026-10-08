#!/usr/bin/env python3
"""Torch-free speaker similarity: MFCC(20)+delta statistics (mean/std over voiced frames) -> cosine vs a reference.
Crude next to resemblyzer, but consistent for ranking engines that read the same text. Usage: spk_sim.py REF.wav cand1.wav cand2.wav ..."""
import sys, subprocess, numpy as np
def dct(E, type=2, axis=1, norm="ortho"):
    N = E.shape[1]; k = np.arange(N); n = np.arange(N)
    M = np.cos(np.pi / N * (n[None, :] + 0.5) * k[:, None]) * np.sqrt(2.0 / N); M[0] /= np.sqrt(2.0)
    return E @ M.T

def load(path, sr=16000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32), sr

def mel_fb(sr, nfft=512, nmel=40, fmin=60, fmax=7600):
    m = lambda f: 2595 * np.log10(1 + f / 700.0); im = lambda x: 700 * (10 ** (x / 2595.0) - 1)
    pts = im(np.linspace(m(fmin), m(fmax), nmel + 2)); bins = np.floor((nfft + 1) * pts / sr).astype(int)
    fb = np.zeros((nmel, nfft // 2 + 1))
    for i in range(nmel):
        a, b, c = bins[i], bins[i + 1], bins[i + 2]
        if b > a: fb[i, a:b] = (np.arange(a, b) - a) / (b - a)
        if c > b: fb[i, b:c] = (c - np.arange(b, c)) / (c - b)
    return fb

def feats(x, sr):
    x = x - x.mean(); pre = np.append(x[0], x[1:] - 0.97 * x[:-1])
    win, hop, nfft = 400, 160, 512
    n = (len(pre) - win) // hop
    fr = np.stack([pre[i * hop:i * hop + win] * np.hamming(win) for i in range(n)])
    P = np.abs(np.fft.rfft(fr, nfft)) ** 2
    fb = mel_fb(sr, nfft); E = np.log(P @ fb.T + 1e-8)
    mf = dct(E, type=2, axis=1, norm="ortho")[:, 1:21]
    en = np.log(P.sum(1) + 1e-8); voiced = en > (np.percentile(en, 35))      # drop silence/low-energy frames
    mf = mf[voiced]
    d = np.diff(mf, axis=0)
    v = np.concatenate([mf.mean(0), mf.std(0), d.std(0)])
    return v

def cos(a, b): return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))

ref = feats(*load(sys.argv[1]))
# self-baseline: two halves of the reference
x, sr = load(sys.argv[1]); h = len(x) // 2
base = cos(feats(x[:h], sr), feats(x[h:], sr))
print(f"self-baseline {base:.3f}")
for p in sys.argv[2:]:
    try: print(f"{cos(ref, feats(*load(p))):.3f}  {p}")
    except Exception as e: print("ERR", p, e)
