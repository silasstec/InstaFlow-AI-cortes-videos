"""Build the exact 128 BPM grid: refine phase from all kicks+claps, then per-bar band energies
(sub/bass, mid, hats), kick/clap presence, and the section map. Writes audio/grid128.json."""
import json, sys
import numpy as np, librosa

wav, hits_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
y, sr = librosa.load(wav, sr=44100, mono=True)
dur = len(y) / sr
HOP = 256
BPM = 128.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT
h = json.load(open(hits_path))
kick = np.array([t for t, v in h["kick"]]); clap = np.array(h["clap"])

def phase_of(ts):
    ph = np.mod(ts, BEAT)
    ang = ph / BEAT * 2 * np.pi
    m = np.angle(np.mean(np.exp(1j * ang))) % (2 * np.pi)
    return m / (2 * np.pi) * BEAT
pk, pc = phase_of(kick), phase_of(clap)
print("phase from kicks %.4f s, from claps %.4f s" % (pk, pc))
T0 = round(float(pk), 4)
beats = T0 + BEAT * np.arange(int((dur - T0) / BEAT) + 1)
beats = beats[beats < dur]
print("beats:", len(beats), "bars:", len(beats) / 4, "T0:", T0)

def offs(ts):
    o = np.mod(ts - T0 + BEAT / 2, BEAT) - BEAT / 2
    return {"n": int(ts.size), "med_ms": round(float(np.median(o)) * 1000, 1), "p90_abs_ms": round(float(np.percentile(np.abs(o), 90)) * 1000, 1), "within1frame": round(float((np.abs(o) < 1 / 24 / 2).mean()), 2)}
print("kick offsets:", offs(kick)); print("clap offsets:", offs(clap))
for lo, hi, nm in ((30, 90, "drop1+groove"), (120, 178, "drop2"), (213, 300, "drop3+final")):
    print(nm, "kick:", offs(kick[(kick >= lo) & (kick < hi)]), "clap:", offs(clap[(clap >= lo) & (clap < hi)]))

S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
tt = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=HOP)
def band(lo, hi):
    sel = (freqs >= lo) & (freqs < hi)
    return np.sqrt((S[sel] ** 2).mean(axis=0))
sub = band(30, 120); mid = band(200, 2000); hi_ = band(6000, 16000)
rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
nb = int((dur - T0) / BAR)
bars = []
for i in range(nb):
    a, c = T0 + i * BAR, T0 + (i + 1) * BAR
    w = (tt >= a) & (tt < c)
    bars.append({"bar": i, "t": round(a, 3), "rms": round(float(rms[w].mean()), 4), "sub": round(float(sub[w].mean()), 4), "mid": round(float(mid[w].mean()), 4), "hi": round(float(hi_[w].mean()), 4),
                 "kicks": int(((kick >= a) & (kick < c)).sum()), "claps": int(((clap >= a) & (clap < c)).sum())})
mx = {k: max(b[k] for b in bars) for k in ("rms", "sub", "mid", "hi")}
print("bar  t      rms  sub  mid  hi   k c")
for b in bars:
    print("%3d %7.2f %4.2f %4.2f %4.2f %4.2f %d %d" % (b["bar"], b["t"], b["rms"] / mx["rms"], b["sub"] / mx["sub"], b["mid"] / mx["mid"], b["hi"] / mx["hi"], b["kicks"], b["claps"]))
json.dump({"bpm": BPM, "beat_s": BEAT, "bar_s": BAR, "t0": T0, "n_beats": len(beats), "beats": [round(float(b), 4) for b in beats], "bars": bars, "max": mx}, open(out, "w"))
