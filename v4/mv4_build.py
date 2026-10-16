#!/usr/bin/env python3
"""v4 'director's cut' generator: Katana EDL on the exact 128 BPM grid with per-hit automation.
Usage: mv4_build.py <workspace> [--range A:B] (frames, for previews; EDL is always full length)
Reads  audio/hits128.json, plan/clips_v4.json. Writes comp/edl.json, comp/fx.js, plan/v4_cuts.json, plan/v4_sfx_cues.json
"""
import json, os, sys, math, random
W = sys.argv[1]; os.chdir(W)
H = json.load(open("audio/hits128.json"))
CL = json.load(open("plan/clips_v4.json"))          # {id: {dur, fam, fps, ok}}
FPS = 24; WIDTH = 1920; HEIGHT = 1080
BPM = 128.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT; T0 = H["t0"]; DUR = 320.625; NFR = 7695
random.seed(4128)
def bt(b): return T0 + b * BEAT                      # global beat index -> seconds
def bart(bar, k=0.0): return T0 + (bar * 4 + k) * BEAT
def fr(t): return int(math.floor(t * FPS + 1e-6))    # frame at or before t (0-41 ms early)
def frn(t): return int(round(t * FPS))               # nearest frame (flashes / hits)
BEATS = H["beats"]; G16 = H["grid16"]
PHRASES = H["phrase_starts"]; FILLS = {f["bar"]: f for f in H["fills"]}; DROPS = H["drops"]
SEC = H["sections"]; STATS = H["section_stats"]
def sec_of_bar(bar):
    for s in SEC:
        if s["bar0"] <= bar < s["bar1"]: return s["name"]
    return "OUTRO"
def phrase_pos(bar):
    p = max(p for p in PHRASES if p <= bar); return bar - p
# ---------- hit tables (grid-locked, per-section normalised) ----------
def beat_rec(b): return BEATS[b] if b < len(BEATS) else None
def kick_strength(b):
    r = beat_rec(b); s = STATS.get(sec_of_bar(r["bar"]), {}); ref = max(0.08, s.get("k_on1_3", 0.15))
    return min(1.5, r["k"] / ref)
def clap_strength(b):
    r = beat_rec(b); s = STATS.get(sec_of_bar(r["bar"]), {}); ref = max(0.06, s.get("clap_2_4", 0.12))
    return min(1.5, r["clap"] / ref)
KICK_SECS = {"DROP1", "DROP1_VOX", "GROOVE", "DROP2", "DROP2_SUB", "DROP3", "BREATHER", "FINAL", "OUTRO", "FILL1", "BUILD2"}
CLAP_SECS = {"DROP1", "DROP1_VOX", "GROOVE", "DROP2", "DROP2_SUB", "DROP3", "BREATHER", "FINAL", "OUTRO"}
kicks = []; claps = []
for b in range(len(BEATS)):
    r = BEATS[b]; sn = sec_of_bar(r["bar"])
    if sn in KICK_SECS and kick_strength(b) >= 0.55: kicks.append((round(bt(b), 4), round(min(1.0, kick_strength(b)), 3)))
    if sn in CLAP_SECS and r["beat"] in (1, 3) and clap_strength(b) >= 0.5: claps.append((round(bt(b), 4), round(min(1.0, clap_strength(b)), 3)))
# snare hits inside fill bars (from the 16th grid, snare band)
def fill_snares(bar):
    g = [x for x in G16 if x["bar"] == bar]; ref = max(x["s"] for x in g) + 1e-6
    out = [x["t"] for x in g if x["s"] / ref >= 0.45]
    return out
# intro 8th-note hats (bars 8-15), strength from hat band
ticks = [(x["t"], round(x["hat"], 3)) for x in G16 if 8 <= x["bar"] < 16 and x["sub16"] in (0, 2)]
tmax = max(s for _, s in ticks) + 1e-6; ticks = [(round(t, 4), round(s / tmax, 3)) for t, s in ticks]
phrase_t = [round(bart(p), 4) for p in PHRASES if p < 170]
drop_t = [round(bart(d), 4) for d in DROPS]
# ---------- cut points ----------
# each cut: {"b": global beat (float allowed), "t", "sec", "bar", "pos", "kind"}
cuts = []
def add(b, kind, **kw):
    t = bt(b); bar = int(b // 4)
    cuts.append({"b": b, "t": t, "bar": bar, "sec": sec_of_bar(bar), "pos": phrase_pos(bar), "kind": kind, **kw})
# INTRO
add(0, "intro"); add(16, "intro"); add(32, "voice"); add(48, "voice")
# drops / grooves (8-bar phrases)
def drop_phrase(bar0, bar1, entry=False, sub=False, final=False):
    for bar in range(bar0, bar1):
        pos = phrase_pos(bar); b0 = bar * 4
        if bar in FILLS and pos == 7:
            add(b0, "fill_lead")                     # the fill bar: snare-cut burst is expanded later
            continue
        if entry and bar == bar0:                    # drop entry: 1 bar of half-beat cuts
            for k in range(8): add(b0 + k * 0.5, "drop" if k == 0 else "burst")
            continue
        if entry and bar == bar0 + 1:
            for k in range(4): add(b0 + k, "burst")
            continue
        if final:
            if pos == 6:
                for k in range(8): add(b0 + k * 0.5, "burst")
            else:
                for k in range(4): add(b0 + k, "beat")
            continue
        if sub:
            add(b0, "bar"); continue
        if pos == 6:
            for k in range(4): add(b0 + k, "beat")
        else:
            add(b0, "half"); add(b0 + 2, "half")
drop_phrase(16, 24, entry=True); drop_phrase(24, 32); drop_phrase(32, 48)
# BREAK1: 2 shots of 4 bars
add(48 * 4, "break"); add(52 * 4, "break")
# BUILD1 56-62 + FILL 63
add(56 * 4, "build"); add(58 * 4, "build"); add(59 * 4, "build")
for k in range(4): add(60 * 4 + k, "build")
for k in range(8): add(62 * 4 + k * 0.5, "build_burst")
add(63 * 4, "fill_lead")
drop_phrase(64, 72, entry=True); drop_phrase(72, 88); drop_phrase(88, 96, sub=True)
# HOLE 96-97
add(96 * 4, "hole_freeze"); add(97 * 4, "hole_black")
# BREAK2 98-109: 1 cut per 2 bars
for bar in range(98, 110, 2): add(bar * 4, "break")
# BUILD2 110-113
add(110 * 4, "build"); add(111 * 4, "build"); add(111 * 4 + 2, "build")
for k in range(4): add(112 * 4 + k, "build")
add(113 * 4, "fill_lead")
drop_phrase(114, 122, entry=True); drop_phrase(122, 138)
# BREATHER 138-145: 1 bar cadence, fill 145
for bar in range(138, 145): add(bar * 4, "bar")
add(145 * 4, "fill_lead")
# FINAL 146-161 (entry 1 bar half-beat), last 2 bars H10 hold
drop_phrase(146, 154, entry=True, final=True); drop_phrase(154, 160, final=True)
add(160 * 4, "climax"); add(161 * 4, "fill_lead")
# OUTRO
add(162 * 4, "outro"); add(162 * 4 + 21.33, "outro_hold")
cuts.sort(key=lambda c: c["b"])
# ---------- expand fill bars into snare-cut bursts ----------
exp = []
for c in cuts:
    if c["kind"] != "fill_lead": exp.append(c); continue
    bar = c["bar"]; sn = fill_snares(bar); drop_next = (bar + 1) in DROPS
    b0 = bar * 4
    if drop_next:
        # first half: snare cuts; second half: H02 iris zoom into white-out
        half = [t for t in sn if t < bart(bar, 2) - 0.01]
        for i, t in enumerate(half): cuts_t = (t - T0) / BEAT; exp.append({**c, "b": cuts_t, "t": t, "kind": "snare", "idx": i})
        exp.append({**c, "b": b0 + 2, "t": bt(b0 + 2), "kind": "iris"})
    else:
        if not sn or sn[0] > bart(bar) + 0.05: exp.append({**c, "kind": "snare", "idx": 0})
        for i, t in enumerate(sn):
            if abs(t - bart(bar)) < 0.03 and exp and exp[-1]["kind"] == "snare" and exp[-1]["bar"] == bar: continue
            exp.append({**c, "b": (t - T0) / BEAT, "t": t, "kind": "snare", "idx": i + 1})
cuts = exp
# frames, drop cuts shorter than 2 frames
for c in cuts: c["f0"] = fr(c["t"])
dd = []
for c in cuts:
    if dd and c["f0"] - dd[-1]["f0"] < 2: continue
    dd.append(c)
cuts = dd
for i, c in enumerate(cuts):
    c["f1"] = cuts[i + 1]["f0"] if i + 1 < len(cuts) else NFR
    c["nf"] = c["f1"] - c["f0"]; c["dur"] = c["nf"] / FPS
# ---------- pools ----------
fam = {cid: v["fam"] for cid, v in CL.items() if v.get("ok", True)}
def ids(*fams): return [c for c, f in fam.items() if f in fams]
HERO_FWD = [c for c in ("H03", "H11", "H14", "H04", "H06") if c in fam]
HERO = [c for c in ("H03", "H04", "H05", "H06", "H08", "H10", "H13", "H14") if c in fam]
HERO_CALM = [c for c in ("H01", "H07", "H09", "H05", "H08") if c in fam]
LIPY = [c for c in fam if fam[c] == "L"]
LIPY_FRONT = [c for c in LIPY if c not in ("L01",)]
SPACE = [c for c in fam if fam[c] == "V"] or ids("S")
SPACE_OLD = [c for c in ("S01", "S02", "S08") if c in fam]
NAT = ids("N"); CITY = ids("C"); QUANT = [c for c in ("Q01", "Q02", "Q03", "Q05", "Q07", "Q09") if c in fam]
TEX = [c for c in ("T01", "T04", "T06", "T03") if c in fam]
INSERT = [c for c in ("M43", "M44", "M45", "M46", "V32", "T04", "T01", "V39", "V40") if c in fam]
BURST_OVL = [c for c in ("M41", "M42") if c in fam]
CROWD = [c for c in ("V39", "V40") if c in fam]
POOL = {
    "DROP1": SPACE * 2 + NAT + HERO + LIPY_FRONT + CROWD + QUANT[:3],
    "DROP1_VOX": HERO * 2 + NAT + SPACE + LIPY_FRONT + CITY,
    "GROOVE": NAT * 2 + HERO * 2 + SPACE + CITY + LIPY_FRONT + QUANT,
    "BREAK1": HERO_CALM + NAT[:4] + QUANT + ["T03"] * 2,
    "BUILD1": HERO + SPACE + TEX + INSERT,
    "DROP2": HERO * 2 + SPACE * 2 + CITY + NAT + LIPY_FRONT * 2 + CROWD + INSERT,
    "DROP2_SUB": SPACE + HERO_CALM + QUANT + LIPY_FRONT,
    "BREAK2": SPACE + HERO_CALM + NAT[:5] + QUANT + ["T03"],
    "BUILD2": HERO + SPACE + TEX + INSERT,
    "DROP3": SPACE * 2 + HERO * 2 + NAT + LIPY_FRONT * 2 + CROWD + QUANT + INSERT,
    "BREATHER": HERO_FWD + CITY * 2 + LIPY_FRONT + NAT,
    "FINAL": HERO * 2 + LIPY_FRONT * 2 + SPACE * 2 + CROWD * 2 + INSERT + QUANT + TEX,
    "OUTRO": ["H11"],
}
MIN_IN = {"S05": 3.0, "Q08": 1.2, "T02": 0.8, "H01": 4.0, "T03": 1.0, "T06": 0.6, "V32": 0.5, "V36": 1.0}
cursor = {cid: MIN_IN.get(cid, 0.0) for cid in fam}; usage = {cid: 0 for cid in fam}
def take(cid, need):
    d = CL[cid]["dur"] - 0.2
    if cursor[cid] + need > d:
        cursor[cid] = MIN_IN.get(cid, 0.0) + random.uniform(0, max(0.0, d - need - MIN_IN.get(cid, 0.0))) * 0.6
    ip = cursor[cid]; cursor[cid] += need + 0.25; usage[cid] += 1
    return round(max(MIN_IN.get(cid, 0.0), min(ip, max(0.0, d - need))), 3)
recent = []
def pick(pool, avoid=(), want=None):
    cands = [c for c in pool if c not in avoid and c not in recent[-2:]] or [c for c in pool if c not in avoid] or list(pool)
    if want: cands = [c for c in cands if fam[c] in want] or cands
    cands.sort(key=lambda c: (c in recent[-5:], usage[c] + random.random() * 0.8))
    return cands[0]
# vocal anchors (absolute seconds -> family/clip rule)
CUES = [(44.10, "H09"), (57.94, "H03"), (66.94, "H07"), (75.64, "L01"), (88.78, "H03"), (99.30, "C01"), (105.56, "H03"),
        (108.98, "H09"), (114.54, "C02"), (131.34, "H09"), (149.58, "H04"), (156.44, "H13"), (160.02, "H06"), (165.54, "L01"),
        (170.86, "H13"), (174.86, "H14"), (178.02, "H07"), (183.74, "H03"), (187.64, "H09"), (194.02, "C01"), (198.76, "H03"),
        (202.70, "H09"), (208.28, "C01"), (225.70, "H06"), (243.90, "H14"), (247.5, "H03"), (251.0, "C01"), (258.84, "H03"),
        (262.5, "H11"), (266.0, "C02"), (268.5, "H14")]
LIPY_SLOTS = [(bar, 0) for bar in (18, 26, 36, 44, 66, 70, 76, 84, 90, 116, 124, 132, 140, 148, 152, 156)]   # bars where a LIPY shot is forced
# ---------- assignment ----------
shots = []; sfx = []
H02_DUR = CL["H02"]["dur"] if "H02" in CL else 8.0
hero_prev = None
for i, c in enumerate(cuts):
    k = c["kind"]; sn = c["sec"]; dur = c["dur"]; pos = c["pos"]; bar = c["bar"]
    s = {"f0": c["f0"], "f1": c["f1"], "kind": k, "sec": sn, "bar": bar, "pos": pos, "speed": 1.0}
    cid = None; ip = None
    cue = next((cc for ct, cc in CUES if c["t"] - 0.02 <= ct < c["t"] + dur and cc in fam), None)
    if k == "intro":
        cid = ("V38" if "V38" in fam else "S01") if bar == 0 else ("V34" if "V34" in fam else "S06"); ip = 0.0
    elif k == "voice":
        cid = "H01" if bar == 8 else "H09"; ip = 4.0 if cid == "H01" else 0.0
    elif k == "hole_freeze":
        cid = "H07"; ip = 2.0; s["speed"] = 0.0
    elif k == "hole_black":
        s["special"] = "black"
    elif k == "iris":
        cid = "H02"; ip = round(max(0.0, H02_DUR - dur - 0.05), 3)
    elif k == "drop":
        cid = pick([x for x in ("V36", "M41", "V32", "T06", "Q08") if x in fam]); ip = MIN_IN.get(cid, 0.0)
        if cid == "V36": ip = 1.0
    elif k == "snare":
        idx = c.get("idx", 0)
        if idx % 2 == 1 and hero_prev and hero_prev[0] in fam:   # intercut: continue the previous hero shot
            cid = hero_prev[0]; ip = round(hero_prev[1] + (c["t"] - hero_prev[2]), 3)
            if ip > CL[cid]["dur"] - dur - 0.1: ip = None; cid = None
        if cid is None:
            cid = pick(INSERT + CROWD + BURST_OVL if sn in ("FINAL", "DROP2", "DROP3", "DROP1") else INSERT + TEX, avoid=("M42",))
    elif k == "climax":
        cid = "H10"; ip = round(max(0.0, CL["H10"]["dur"] - 0.2 - dur), 3)
    elif k == "outro":
        cid = "H11"; ip = 0.0
    elif k == "outro_hold":
        cid = "H11"; s["speed"] = 0.0; s["srcf"] = 236; ip = 9.85
    elif k == "break":
        cid = cue or pick(POOL[sn]); s["speed"] = 0.5 if fam[cid] in ("H", "N", "L") else 0.7; s["blend"] = True
    elif k in ("build", "build_burst"):
        cid = cue or pick(POOL[sn], want=None)
    else:
        forced = next((True for fb, _ in LIPY_SLOTS if fb == bar and pos == c["pos"] and c["b"] == bar * 4), False)
        if cue: cid = cue
        elif forced and LIPY_FRONT: cid = pick(LIPY_FRONT)
        else:
            want = None
            if k == "beat" and sn == "FINAL": want = None
            cid = pick(POOL[sn])
    if "special" not in s:
        if ip is None: ip = take(cid, dur * max(0.5, s["speed"] if s["speed"] else 1.0))
        s["clip"] = cid; s["src"] = ip
        if fam.get(cid) in ("H", "L") and k not in ("snare",): hero_prev = (cid, ip, c["t"])
        recent.append(cid)
    shots.append(s)
# ---------- effects per shot ----------
AMT = {"DROP1": 0.075, "DROP1_VOX": 0.065, "GROOVE": 0.06, "DROP2": 0.075, "DROP2_SUB": 0.04, "DROP3": 0.08, "BREATHER": 0.045, "FINAL": 0.09, "OUTRO": 0.03, "BUILD2": 0.05, "FILL1": 0.06}
flash_events = []   # (t, kind) for the <=3/s budget
def flash_ok(t):
    return sum(1 for ft, _ in flash_events if abs(ft - t) < 1.0) < 3
def flash(t, kind):
    if flash_ok(t): flash_events.append((t, kind)); return True
    return False
K = []; specials = []
LOOK_DROP = {"type": "grade", "filter": "contrast(1.1) saturate(1.28) brightness(0.98)", "layers": [{"op": "soft-light", "color": "rgba(0,60,90,0.22)"}, {"op": "screen", "color": "rgba(255,60,160,0.05)"}, {"op": "screen", "color": "rgba(255,170,60,0.04)"}]}
LOOK_BREAK = {"type": "grade", "filter": "contrast(1.04) saturate(0.95) sepia(0.18)", "layers": [{"op": "soft-light", "color": "rgba(90,30,140,0.26)"}, {"op": "screen", "color": "rgba(255,150,40,0.06)"}]}
LOOK_BUILD = {"type": "grade", "filter": "contrast(1.08) saturate(1.15)", "layers": [{"op": "soft-light", "color": "rgba(40,20,120,0.2)"}, {"op": "screen", "color": "rgba(255,120,40,0.05)"}]}
LOOK_INTRO = {"type": "grade", "filter": "contrast(1.05) saturate(0.78)", "layers": [{"op": "soft-light", "color": "rgba(20,50,90,0.28)"}]}
OUTRO_SAT = [0.7, 0.45, 0.2]
for i, s in enumerate(shots):
    if "special" in s:
        K.append({"f0": s["f0"], "f1": s["f1"], "special": {"type": "black", "sparkle": False}}); continue
    k, sn, cid, bar, pos = s["kind"], s["sec"], s["clip"], s["bar"], s["pos"]
    t0 = s["f0"] / FPS; dur = (s["f1"] - s["f0"]) / FPS
    o = {"f0": s["f0"], "f1": s["f1"], "clip": cid, "src": s["src"], "speed": s["speed"]}
    if "srcf" in s: o["srcf"] = s["srcf"]
    if s.get("blend"): o["blend"] = True
    cam = {}; fx = {}; layers = []
    isface = fam[cid] in ("H", "L")
    # hits inside the shot
    kh = [(round(t - t0, 3), st) for t, st in kicks if t0 - 0.02 <= t < t0 + dur - 0.04]
    ch = [(round(t - t0, 3), st) for t, st in claps if t0 - 0.02 <= t < t0 + dur - 0.04]
    amt = AMT.get(sn, 0.0)
    if fam[cid] == "V": amt *= 0.85
    if amt and kh and k not in ("snare", "iris"):
        cam["punch"] = {"hits": [h for h, _ in kh], "amt": round(amt, 3), "d": 0.2, "curve": 2}
    if ch and k not in ("snare", "iris", "break"):
        fx["k_clap"] = {"v": 14 if sn == "FINAL" else 11, "amt": 1.0, "win": 0.3}
    # section looks
    if sn in ("INTRO_A", "INTRO_B"): o["look"] = LOOK_INTRO
    elif sn in ("BREAK1", "BREAK2", "HOLE"): o["look"] = LOOK_BREAK
    elif sn in ("BUILD1", "BUILD2", "FILL1"): o["look"] = LOOK_BUILD
    elif sn == "OUTRO": o["look"] = {"type": "grade", "filter": "contrast(1.05) saturate(%.2f)" % OUTRO_SAT[min(2, i - next(j for j, x in enumerate(shots) if x["sec"] == "OUTRO"))]}
    else: o["look"] = LOOK_DROP
    # psychedelic looks on non-face shots
    if not isface and sn in ("FINAL", "DROP3", "DROP2") and (pos >= 4 or sn == "FINAL"):
        o["look"] = {"type": "k_hue", "base": LOOK_DROP, "period": 2 if sn == "FINAL" else 4, "amp": 1.0 if sn == "FINAL" else 0.45, "sat": 1.3}
    if not isface and sn in ("BREAK1", "BREAK2"):
        o["look"] = {"type": "k_hue", "base": LOOK_BREAK, "period": 4, "amp": 0.35, "sat": 1.05}
    # kinds
    if k == "drop":
        o["in"] = {"type": "white", "d": 0.125}; flash_events.append((t0, "drop_white"))
        layers.append({"type": "invert", "at": 0.125, "d": 0.084, "order": 120}); flash_events.append((t0 + 0.125, "invert"))
        cam["shake"] = {"at": 0, "amp": [26, 18], "d": 0.35}; cam["punch"] = {"at": 0, "amt": 0.14, "d": 0.45}
        fx["k_radial"] = {"at": 0, "d": 0.4, "amt": 1.0}; fx["k_particles"] = {"amt": 1.0, "big": True}
        sfx.append({"t": t0, "kind": "boom"})
    elif k == "iris":
        cam["zoom"] = {"z0": 1.0, "z1": 1.5, "ease": "in3"}; o["speed1"] = 1.6
        o["out"] = {"type": "white", "d": 0.167}; flash_events.append((t0 + dur - 0.167, "whiteout"))
        fx["rgbsplit"] = {"v": 10, "at": 0, "d": dur, "decay": 0}; fx["glitch"] = {"at": max(0, dur - 0.5), "d": 0.5, "amt": 0.35, "seed": 3 + i}
        sfx.append({"t": t0 + dur - 0.167, "kind": "hit"})
    elif k == "snare":
        cam["punch"] = {"at": 0, "amt": 0.09, "d": 0.12}
        if s.get("idx", 0) % 2 == 0: fx["rgbsplit"] = {"v": 10, "at": 0, "d": 0.1, "decay": 0.06}
        if fam[cid] == "M" and cid in ("M41", "M42"): flash_events.append((t0, "ovl"))
        if s.get("idx", 0) == 0: fx["glitch"] = {"at": 0, "d": min(dur, 0.12), "amt": 0.3, "seed": 11 + i}
        sfx.append({"t": t0, "kind": "glitch"})
    elif k == "intro":
        cam["zoom"] = {"z0": 1.0, "z1": 1.1, "ease": "lin"}; fx["k_dust"] = {"amt": 0.6}
        if bar >= 8: fx["k_tick"] = {"amt": 1.0}
        if bar == 0: o["in"] = {"type": "dip", "color": "#000000", "d": 0.5}
    elif k == "voice":
        cam["zoom"] = {"z0": 1.0, "z1": 1.07, "ease": "lin"}; fx["k_tick"] = {"amt": 0.8}; fx["k_dust"] = {"amt": 0.35}
        o["in"] = {"type": "blur", "d": 0.3, "max": 12}
    elif k == "hole_freeze":
        cam["push"] = {"rate": 0.04}; o["out"] = {"type": "dip", "color": "#000000", "d": 0.35}; fx["k_particles"] = False
    elif k == "break":
        fx["trail"] = {"n": 4, "step": 2, "alpha": 0.32}; cam["zoom"] = {"z0": 1.0, "z1": 1.12, "ease": "lin"}
        fx["k_dust"] = {"amt": 0.5}
        if not isface: fx["k_kaleido"] = {"n": 6, "amt": 0.55, "spin": 0.08}
        o["in"] = {"type": "blur", "d": 0.35, "max": 16}
        if i and shots[i - 1]["kind"] == "hole_black":
            o["in"] = {"type": "flashlight", "d": 0.2}; flash_events.append((t0, "flashlight"))
    elif k in ("build", "build_burst"):
        sec = next(x for x in SEC if x["name"] == sn); prog = (t0 - sec["t0"]) / max(0.1, sec["t1"] - sec["t0"])
        o["speed1"] = round(1.0 + 1.2 * prog, 2)
        cam["zoom"] = {"z0": 1.0, "z1": round(1.1 + 0.25 * prog, 2), "ease": "in2"}
        if dur <= BEAT + 0.01: cam["ladder"] = {"steps": [1, 1.06, 1.12, 1.18]}
        fx["rgbsplit"] = {"v": round(3 + 8 * prog, 1), "at": 0, "d": dur, "decay": 0}
        if prog > 0.6: fx["glitch"] = {"at": 0, "d": dur, "amt": round(0.2 + 0.3 * prog, 2), "seed": 5 + i, "blocks": prog > 0.85}
        fx["k_dust"] = {"amt": round(0.3 + 0.6 * prog, 2)}
        if k == "build_burst": cam["punch"] = {"at": 0, "amt": 0.08, "d": 0.1}
    elif k == "climax":
        cam["zoom"] = {"z0": 1.0, "z1": 1.18, "ease": "in2"}; cam["ladder"] = {"steps": [1, 1.04, 1.08, 1.12, 1.16, 1.2, 1.24, 1.28]}
        fx["k_radial"] = {"at": dur - 0.45, "d": 0.45, "amt": 0.8}; fx["k_particles"] = {"amt": 1.0}
    elif k == "outro":
        cam["zoom"] = {"z0": 1.0, "z1": 1.08, "ease": "lin"}; o["in"] = {"type": "dip", "color": "#000000", "d": 0.3}; fx["k_dust"] = {"amt": 0.4}
    elif k == "outro_hold":
        o["out"] = {"type": "dip", "color": "#000000", "d": round(dur - 0.8, 2)}
    else:
        # drop-section shots
        is_phrase = any(abs(t0 - pt) < 0.03 for pt in phrase_t)
        is_bar = abs((t0 - T0) / BAR - round((t0 - T0) / BAR)) < 0.02
        if is_phrase and k != "burst":
            if flash(t0, "flashlight"): o["in"] = {"type": "flashlight", "d": 0.14}
            cam["shake"] = {"at": 0, "amp": [18, 12], "d": 0.25}; fx["k_rays"] = {"at": 0, "d": 0.5, "amt": 0.9}
            fx["k_particles"] = {"amt": 0.9}; sfx.append({"t": t0, "kind": "flash"})
        elif is_bar and sn in ("FINAL", "DROP2", "DROP3", "DROP1") and pos in (2, 4, 6):
            if flash(t0, "bar_white"): specials.append({"t0": "f%d" % s["f0"], "n": 1, "type": "white", "splat": False})
        if k == "burst":
            cam["punch"] = {"at": 0, "amt": 0.085, "d": 0.12}
            if sn == "FINAL" and pos == 6 and s["f0"] % 2 == 0: fx["rgbsplit"] = {"v": 12, "at": 0, "d": 0.1, "decay": 0.05}
        if sn == "FINAL":
            fx["k_particles"] = {"amt": 0.8}
            if pos in (2, 3, 6, 7) and s["f0"] % 4 == 0 and not isface and bar % 2 == 0 and flash(t0, "neg"):
                layers.append({"type": "invert", "at": 0, "d": 0.084, "order": 120})
            if pos >= 4 and not isface: fx["k_kaleido"] = {"n": 8, "amt": 0.6, "spin": 0.25}
            if i % 3 == 0: fx["leak"] = {"amt": 0.28, "seed": i % 9, "color": "#ffb347"}
        if sn in ("DROP2", "DROP3") and pos >= 4 and not isface and k != "burst":
            fx["k_kaleido"] = {"n": 6, "amt": 0.45, "spin": 0.15}
        if fam[cid] == "V": fx["k_dust"] = {"amt": 0.55}
        if fam[cid] in ("H", "L") and k == "half": cam["zoom"] = {"z0": 1.0, "z1": 1.05, "ease": "lin"}
        if sn in ("BREATHER", "DROP2_SUB"): fx["k_dust"] = {"amt": 0.4}; cam["zoom"] = {"z0": 1.0, "z1": 1.08, "ease": "lin"}
        if sn in ("DROP2_SUB",) and not isface: fx["trail"] = {"n": 3, "step": 2, "alpha": 0.25}
    if cam: o["cam"] = cam
    if fx: o["fx"] = fx
    if layers: o["layers"] = layers
    K.append(o)
# flash-rate audit
import collections
viol = []
for t, _ in flash_events:
    n = sum(1 for ft, _ in flash_events if 0 <= ft - t < 1.0)
    if n > 3: viol.append(round(t, 2))
# ---------- hits tables for fx.js ----------
tables = {"T0": T0, "BEAT": BEAT, "BAR": BAR, "kicks": kicks, "claps": claps, "phrases": phrase_t, "drops": drop_t, "ticks": ticks}
used = sorted({o["clip"] for o in K if "clip" in o})
EDL = {
    "canvas": {"w": WIDTH, "h": HEIGHT, "fps": FPS, "frames": NFR, "bg": "#000000", "boil": 1},
    "beat": {"bpm": BPM, "t0": T0},
    "palette": {"ink": "#000000", "accent": "#ffffff", "cyan": "#49d7ff", "amber": "#ffb347", "magenta": "#ff3cb4"},
    "look": LOOK_DROP,
    "cam": {"fit": "cover", "cover": True},
    "clips": {cid: {"frames_dir": "plates/%s" % cid} for cid in used},
    "shots": K, "specials": specials,
    "post": {"grain": {"amt": 0.24}, "vignette": {"v": 0.26, "r0": 0.5, "r1": 1.0}},
    "sfx": {"auto": False, "cues": [], "hits": False},
    "audio": {"src": "audio/track.wav", "start": 0, "sfx": False},
}
os.makedirs("comp", exist_ok=True)
json.dump(EDL, open("comp/edl.json", "w"), indent=0)
json.dump({"cuts": shots, "flash_events": flash_events, "violations": viol}, open("plan/v4_cuts.json", "w"), indent=0)
json.dump(sfx, open("plan/v4_sfx_cues.json", "w"), indent=0)
# fx.js with the tables inlined
fxjs = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fx_v4.js")).read()
open("comp/fx.js", "w").write("const KT = " + json.dumps(tables) + ";\n" + fxjs)
kinds = collections.Counter(s["kind"] for s in shots)
print(json.dumps({"shots": len(K), "specials": len(specials), "clips": len(used), "kinds": kinds, "kicks": len(kicks), "claps": len(claps),
                  "flash_events": len(flash_events), "flash_violations": viol[:10], "top_usage": dict(sorted(usage.items(), key=lambda kv: -kv[1])[:10]),
                  "lipy_shots": sum(1 for o in K if fam.get(o.get("clip")) == "L"), "space_shots": sum(1 for o in K if fam.get(o.get("clip")) == "V")}))
