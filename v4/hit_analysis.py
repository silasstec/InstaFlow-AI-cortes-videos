"""Transient / hit analysis for beat-reactive editing.
Outputs hits.json: per-band onsets (kick, snare/clap, hat, crash), beat-phase check vs the v2 beat grid,
per-beat strength table, snare-roll/riser detection, top-decile 'power hits', section energy, and a per-second summary.
"""
import json, sys
import numpy as np
import librosa

wav, grid_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
y, sr = librosa.load(wav, sr=44100, mono=True)
dur = len(y) / sr
grid = json.load(open(grid_path)); beats = np.array(grid["beats"]); bar = grid["bar_len_s"]; beat_len = 60.0 / grid["bpm"]
HOP = 256

def band_onsets(lo, hi, delta, wait, pre_max=3, post_max=3):
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    sel = (freqs >= lo) & (freqs < hi)
    env = librosa.onset.onset_strength(S=librosa.power_to_db(S[sel] ** 2 + 1e-10), sr=sr, hop_length=HOP, aggregate=np.median)
    env = env / (env.max() + 1e-9)
    peaks = librosa.util.peak_pick(env, pre_max=pre_max, post_max=post_max, pre_avg=12, post_avg=12, delta=delta, wait=wait)
    t = librosa.frames_to_time(peaks, sr=sr, hop_length=HOP)
    return [(round(float(a), 3), round(float(env[p]), 3)) for a, p in zip(t, peaks)], env

kick, kenv = band_onsets(35, 130, delta=0.12, wait=int(0.18 * sr / HOP))
snare, senv = band_onsets(150, 420, delta=0.10, wait=int(0.12 * sr / HOP))
snare_hi, shenv = band_onsets(1800, 6500, delta=0.10, wait=int(0.12 * sr / HOP))
hat, henv = band_onsets(7000, 16000, delta=0.08, wait=int(0.08 * sr / HOP))
crash, cenv = band_onsets(3000, 14000, delta=0.25, wait=int(0.6 * sr / HOP), pre_max=6, post_max=6)

# snare/clap = coincidence of mid-band and high-band onsets within 25 ms
snare_t = [t for t, _ in snare]; hi_t = np.array([t for t, _ in snare_hi]) if snare_hi else np.array([])
claps = [round(t, 3) for t in snare_t if hi_t.size and np.min(np.abs(hi_t - t)) < 0.03]

# beat-phase check: for each kick in loud sections, offset to nearest grid beat
def phase_stats(ev, t0, t1):
    ts = np.array([t for t, _ in ev if t0 <= t <= t1])
    if ts.size == 0: return None
    idx = np.abs(beats[None, :] - ts[:, None]).argmin(axis=1)
    off = ts - beats[idx]
    return {"n": int(ts.size), "median_offset_ms": round(float(np.median(off)) * 1000, 1), "p90_abs_ms": round(float(np.percentile(np.abs(off), 90)) * 1000, 1)}
phase = {"kick_drop2": phase_stats(kick, 119, 172), "kick_drop4": phase_stats(kick, 214, 273), "kick_drop1": phase_stats(kick, 31, 52),
         "snare_drop2": phase_stats(snare, 119, 172), "snare_drop4": phase_stats(snare, 214, 273)}

# per-beat strength table (max env within +-40 ms of each beat)
def near(env, t, w=0.04):
    a = max(0, int((t - w) * sr / HOP)); b = min(len(env) - 1, int((t + w) * sr / HOP)); return float(env[a:b + 1].max()) if b > a else 0.0
per_beat = [{"i": i, "t": round(float(t), 3), "k": round(near(kenv, t), 2), "s": round(near(senv, t), 2), "h": round(near(henv, t), 2), "c": round(near(cenv, t), 2)} for i, t in enumerate(beats)]

# broadband onset strength -> 'power hits' (top 8% of all onsets, min 0.35 s apart)
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP); oenv = oenv / oenv.max()
pk = librosa.util.peak_pick(oenv, pre_max=4, post_max=4, pre_avg=20, post_avg=20, delta=0.05, wait=int(0.35 * sr / HOP))
pt = librosa.frames_to_time(pk, sr=sr, hop_length=HOP); pv = oenv[pk]
thr = np.percentile(pv, 92) if pv.size else 1.0
power = [{"t": round(float(a), 3), "v": round(float(v), 3)} for a, v in zip(pt, pv) if v >= thr]

# snare rolls / build-ups: windows of 1 bar where snare onset count >= 8 (8th-note rolls) or >= 12 (16ths)
rolls = []
st = np.array(snare_t)
for b0 in beats[::4]:
    n = int(((st >= b0) & (st < b0 + bar)).sum())
    if n >= 7: rolls.append({"t": round(float(b0), 3), "hits_in_bar": n})
# risers: 4-bar windows with monotonically rising spectral centroid + rising rms
cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=HOP)[0]; rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
tt = librosa.frames_to_time(np.arange(len(cent)), sr=sr, hop_length=HOP)
risers = []
for b0 in beats[::4]:
    w = (tt >= b0) & (tt < b0 + 4 * bar)
    if w.sum() < 10: continue
    c = cent[w]; r = rms[w]; q = len(c) // 4
    if c[-q:].mean() > 1.25 * c[:q].mean() and r[-q:].mean() > 1.1 * r[:q].mean() and c[-q:].mean() > 2600:
        risers.append({"t": round(float(b0), 3), "cent_rise": round(float(c[-q:].mean() / c[:q].mean()), 2)})

# per-second summary
secs = []
for s in range(int(dur)):
    w = (tt >= s) & (tt < s + 1)
    secs.append({"s": s, "rms": round(float(rms[w].mean()), 4) if w.any() else 0, "cent": int(cent[w].mean()) if w.any() else 0,
                 "kicks": int(sum(1 for t, _ in kick if s <= t < s + 1)), "snares": int(sum(1 for t in snare_t if s <= t < s + 1)),
                 "hats": int(sum(1 for t, _ in hat if s <= t < s + 1))})

res = {"duration": round(dur, 3), "counts": {"kick": len(kick), "snare": len(snare), "clap": len(claps), "hat": len(hat), "crash": len(crash), "power": len(power)},
       "phase": phase, "kick": kick, "snare": snare, "clap": claps, "hat": hat, "crash": crash, "power": power, "rolls": rolls, "risers": risers,
       "per_beat": per_beat, "per_sec": secs}
json.dump(res, open(out, "w"))
print(json.dumps({k: res[k] for k in ("counts", "phase")}, indent=1))
print("crash:", [t for t, v in crash][:40])
print("rolls:", rolls[:30])
print("risers:", risers[:30])
print("power hits:", [p["t"] for p in power][:60])
