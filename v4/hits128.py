"""Grid-locked hit map on the exact 128 BPM grid (T0 from grid128.json).
For every 16th-note position: band onset strengths (kick, snare, clap-coincidence, hat, crash) = max of the
band onset envelope within +-15 ms. Plus: section map, phrase starts, fill bars, build windows, intro ticks,
and per-beat/half-beat summaries used by the v4 EDL generator. Writes audio/hits128.json."""
import json, sys
import numpy as np, librosa

wav, grid_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
g = json.load(open(grid_path)); T0 = g["t0"]; BEAT = g["beat_s"]; BAR = g["bar_s"]; NB = len(g["bars"])
y, sr = librosa.load(wav, sr=44100, mono=True); dur = len(y) / sr
HOP = 128  # 2.9 ms resolution
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP)); freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
def env(lo, hi):
    sel = (freqs >= lo) & (freqs < hi)
    e = librosa.onset.onset_strength(S=librosa.power_to_db(S[sel] ** 2 + 1e-10), sr=sr, hop_length=HOP, aggregate=np.median)
    return e / (e.max() + 1e-9)
E = {"kick": env(35, 130), "snare": env(150, 420), "hi": env(1800, 6500), "hat": env(7000, 16000), "crash": env(2500, 12000)}
rms = librosa.feature.rms(y=y, hop_length=HOP)[0]; rms = rms / rms.max()
sub = np.sqrt((S[(freqs >= 30) & (freqs < 120)] ** 2).mean(axis=0)); sub = sub / sub.max()
nfr = S.shape[1]
def at(e, t, w=0.015):
    a = max(0, int((t - w) * sr / HOP)); b = min(nfr - 1, int((t + w) * sr / HOP)); return float(e[a:b + 1].max()) if b >= a else 0.0

SIX = BEAT / 4
n16 = int((dur - T0) / SIX)
grid = []
for i in range(n16):
    t = T0 + i * SIX
    k, s, h, ht, c = (at(E["kick"], t), at(E["snare"], t), at(E["hi"], t), at(E["hat"], t), at(E["crash"], t, 0.03))
    grid.append({"i": i, "t": round(t, 4), "bar": i // 16, "beat": (i // 4) % 4, "sub16": i % 4, "k": round(k, 3), "s": round(s, 3), "clap": round(min(s, h), 3), "hat": round(ht, 3), "crash": round(c, 3)})

# section map (bars) from the per-bar energy analysis, phrase starts with the 2-bar hole at 96-97
sections = [
    ("INTRO_A", 0, 8), ("INTRO_B", 8, 16), ("DROP1", 16, 24), ("DROP1_VOX", 24, 32), ("GROOVE", 32, 48),
    ("BREAK1", 48, 56), ("BUILD1", 56, 63), ("FILL1", 63, 64), ("DROP2", 64, 88), ("DROP2_SUB", 88, 96), ("HOLE", 96, 98),
    ("BREAK2", 98, 110), ("BUILD2", 110, 114), ("DROP3", 114, 138), ("BREATHER", 138, 146), ("FINAL", 146, 162), ("OUTRO", 162, 171)]
sec = [{"name": n, "bar0": a, "bar1": b, "t0": round(T0 + a * BAR, 3), "t1": round(T0 + b * BAR, 3)} for n, a, b in sections]
phrase_starts = list(range(0, 96, 8)) + [96] + list(range(98, 171, 8))
fill_bars = [p - 1 for p in phrase_starts if p - 1 >= 16 and p - 1 not in (95, 97)] + [95]
fill_bars = sorted(set(fill_bars))
drops = [16, 64, 114, 146]
# verify fills: snare count in bar
snare_env = E["snare"]
def bar_snares(b):
    a, c = T0 + b * BAR, T0 + (b + 1) * BAR
    pk = librosa.util.peak_pick(snare_env, pre_max=3, post_max=3, pre_avg=20, post_avg=20, delta=0.10, wait=int(0.1 * sr / HOP))
    tt = librosa.frames_to_time(pk, sr=sr, hop_length=HOP)
    return int(((tt >= a) & (tt < c)).sum())
fills = [{"bar": b, "t": round(T0 + b * BAR, 3), "snares": bar_snares(b)} for b in fill_bars]
# intro ticks: high-band onsets in bars 0-16 quantized to the 16th grid, histogram of positions mod 6 (dotted 8th)
hi_env = E["hat"]
pk = librosa.util.peak_pick(hi_env, pre_max=3, post_max=3, pre_avg=12, post_avg=12, delta=0.08, wait=int(0.08 * sr / HOP))
tt = librosa.frames_to_time(pk, sr=sr, hop_length=HOP); tt = tt[(tt >= T0) & (tt < T0 + 16 * BAR)]
q = np.round((tt - T0) / SIX).astype(int)
hist6 = np.bincount(q % 6, minlength=6).tolist(); hist4 = np.bincount(q % 4, minlength=4).tolist()
# per-beat summary
beats = []
for b in range(n16 // 4):
    g4 = grid[b * 4: b * 4 + 4]
    beats.append({"i": b, "t": g4[0]["t"], "bar": b // 4, "beat": b % 4, "k": g4[0]["k"], "clap": g4[0]["clap"], "s": g4[0]["s"], "hat": g4[0]["hat"], "crash": g4[0]["crash"], "k_off": g4[2]["k"], "hat_off": g4[2]["hat"], "rms": round(at(rms, g4[0]["t"], 0.1), 3), "sub": round(at(sub, g4[0]["t"], 0.1), 3)})
# section stats for thresholds
stats = {}
for s_ in sec:
    bb = [x for x in beats if s_["t0"] <= x["t"] < s_["t1"]]
    if not bb: continue
    stats[s_["name"]] = {"k_med": round(float(np.median([x["k"] for x in bb])), 3), "k_on1_3": round(float(np.median([x["k"] for x in bb if x["beat"] in (0, 2)])), 3), "clap_2_4": round(float(np.median([x["clap"] for x in bb if x["beat"] in (1, 3)])), 3), "clap_1_3": round(float(np.median([x["clap"] for x in bb if x["beat"] in (0, 2)])), 3), "hat_off": round(float(np.median([x["hat_off"] for x in bb])), 3), "rms": round(float(np.median([x["rms"] for x in bb])), 3), "sub": round(float(np.median([x["sub"] for x in bb])), 3)}
print(json.dumps(stats, indent=0))
print("fills:", fills)
print("intro tick histogram mod6 (dotted-8th):", hist6, "mod4:", hist4, "n=", len(q))
json.dump({"bpm": 128.0, "t0": T0, "beat_s": BEAT, "bar_s": BAR, "six_s": SIX, "sections": sec, "phrase_starts": phrase_starts, "fills": fills, "drops": drops,
           "intro_ticks": {"hist_mod6": hist6, "hist_mod4": hist4}, "section_stats": stats, "beats": beats, "grid16": grid}, open(out, "w"))
print("beats", len(beats), "grid16", len(grid))
