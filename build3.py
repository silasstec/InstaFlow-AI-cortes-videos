#!/usr/bin/env python3
"""Palácio Sintra — Ronan BSC ad, v2 (high-energy recut).
Speed ramps with temporal/radial motion blur, per-pixel whip-pan and zoom-blur
transitions, punch-ins, sequential two-tier kinetic lockups, whoosh SFX, music bed.
SMOKE=1 runs the whole pipeline on synthetic sources (no network, no whisper)."""
import json, os, re, subprocess, shutil, math, sys

W, H, FPS = 1080, 1920, 30
SMOKE = os.environ.get("SMOKE") == "1"
OUT = "out2"; os.makedirs(OUT, exist_ok=True)
FONTDIR = "fonts"; os.makedirs(FONTDIR, exist_ok=True)
B = "https://d8j0ntlcm91z4.cloudfront.net/user_376XPpNiKYP0wVBJ1xS3f4v7M2A/"
CFG = json.load(open("cfg2.json")) if not SMOKE else {"src": {}, "tempo": 1.08}
SRC = CFG["src"]; TEMPO = float(CFG.get("tempo", 1.08))
PRES = {"P1": "vo1", "P2": "vo5", "P3": "vo7"}            # presenter clip -> its voice line
BROLL_VO = ("vo2", "vo3", "vo4", "vo6")

def sh(cmd, check=True):
    print("+", cmd[:240], flush=True)
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and r.returncode != 0:
        print(r.stderr[-3000:]); raise SystemExit("FAILED: " + cmd[:200])
    return r
def dur(f):
    return float(sh(f"ffprobe -v error -show_entries format=duration -of csv=p=0 '{f}'").stdout.strip())

# ---------- 1. assets ----------
os.makedirs("src", exist_ok=True)
if SMOKE:
    for i, k in enumerate(["P1", "P2", "P3"] + [f"b1{n:02d}" for n in range(1, 14)] + [f"c{n}" for n in range(71, 85)]):
        p = f"src/{k}.mp4"
        if not os.path.exists(p):
            L = 8 if k in ("P2", "P3") else 5
            sh(f"ffmpeg -v error -y -f lavfi -i testsrc2=size={W}x{H}:rate=30:duration={L} -f lavfi -i 'sine=frequency={200+30*i}:duration={L}' "
               f"-vf 'drawtext=text={k}:fontsize=260:fontcolor=white:x=(w-tw)/2:y=(h-th)/2,hue=h={i*25}' -c:v libx264 -preset ultrafast -crf 22 -c:a aac -shortest {p}")
    for k, L in [("vo1", 3.7), ("vo2", 5.5), ("vo3", 7.9), ("vo4", 5.0), ("vo5", 7.7), ("vo6", 4.0), ("vo7", 6.2)]:
        p = f"src/{k}.mp3"
        if not os.path.exists(p):
            sh(f"ffmpeg -v error -y -f lavfi -i 'sine=frequency=220:duration={L}' -af 'tremolo=f=3:d=0.9' -c:a libmp3lame -q:a 4 {p}")
    if not os.path.exists("src/music.mp3"):
        sh("ffmpeg -v error -y -f lavfi -i 'sine=frequency=110:duration=40' -af 'tremolo=f=2:d=0.8' -c:a libmp3lame -q:a 4 src/music.mp3")
else:
    for k, v in SRC.items():
        ext = ".mp3" if v.endswith(".mp3") else ".mp4"
        dst = f"src/{k}{ext}"
        if not (os.path.exists(dst) and os.path.getsize(dst) > 1000):
            sh(f"curl -sL --retry 3 -o '{dst}' '{v if v.startswith('http') else B + v}'")
    if CFG.get("music_url") and not (os.path.exists("src/music.mp3") and os.path.getsize("src/music.mp3") > 10000):
        sh(f"curl -sL --retry 3 -o src/music.mp3 '{CFG['music_url']}'")
for name, url in [("ArchivoBlack-Regular.ttf", "https://github.com/google/fonts/raw/main/ofl/archivoblack/ArchivoBlack-Regular.ttf"),
                  ("Inter.ttf", "https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"),
                  ("Montserrat-ExtraBold.ttf", "https://github.com/google/fonts/raw/main/ofl/montserrat/static/Montserrat-ExtraBold.ttf")]:
    p = f"{FONTDIR}/{name}"
    if not (os.path.exists(p) and os.path.getsize(p) > 50000):
        local = f"/usr/share/fonts/truetype/higgsfield/{name}"
        if os.path.exists(local): shutil.copy(local, p)
        else: sh(f"curl -sL -o {p} '{url}'", check=False)
ok = lambda n: os.path.exists(f"{FONTDIR}/{n}") and os.path.getsize(f"{FONTDIR}/{n}") > 50000
KEYFONT, KEYFILE = ("Archivo Black", f"{FONTDIR}/ArchivoBlack-Regular.ttf") if ok("ArchivoBlack-Regular.ttf") else ("Montserrat ExtraBold", f"{FONTDIR}/Montserrat-ExtraBold.ttf")
SUBFONT, SUBFILE = ("Inter", f"{FONTDIR}/Inter.ttf") if ok("Inter.ttf") else ("Montserrat ExtraBold", f"{FONTDIR}/Montserrat-ExtraBold.ttf")
CAPFILE = f"{FONTDIR}/Montserrat-ExtraBold.ttf" if ok("Montserrat-ExtraBold.ttf") else KEYFILE
print("fonts:", KEYFONT, "/", SUBFONT, flush=True)

# ---------- 2. voice lines ----------
# b-roll VO: tempo-up + trim silences. Presenter VO: tempo-up only (offset vs clip measured below).
VO = {}
for k in BROLL_VO:
    sh(f"ffmpeg -v error -y -i src/{k}.mp3 -af 'atempo={TEMPO},silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,loudnorm=I=-16:TP=-1.5:LRA=11' -ar 48000 src/{k}_t.wav")
    VO[k] = dur(f"src/{k}_t.wav")
for k in PRES.values():
    sh(f"ffmpeg -v error -y -i src/{k}.mp3 -af 'atempo={TEMPO},loudnorm=I=-16:TP=-1.5:LRA=11' -ar 48000 src/{k}_t.wav")

# presenter clips: speed video+audio by TEMPO (keeps lips in sync with the tempo'd line)
import numpy as np
def envelope(path):
    raw = subprocess.run(f"ffmpeg -v error -i '{path}' -vn -ac 1 -ar 8000 -f s16le -", shell=True, capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
    n = len(x) // 8 * 8
    e = np.abs(x[:n]).reshape(-1, 8).mean(1)                 # 1 kHz envelope
    e = e - e.mean(); return e / (np.linalg.norm(e) + 1e-9)
LAG = {}
for P, k in PRES.items():
    sh(f"ffmpeg -v error -y -i src/{P}.mp4 -filter_complex '[0:v]setpts=PTS/{TEMPO}[v];[0:a]atempo={TEMPO}[a]' -map '[v]' -map '[a]' -r {FPS} -c:v libx264 -preset fast -crf 15 -c:a aac -b:a 192k src/{P}_t.mp4")
    a = envelope(f"src/{P}_t.mp4"); b = envelope(f"src/{k}_t.wav")
    if len(b) > len(a): a = np.pad(a, (0, len(b) - len(a)))
    c = np.correlate(a, b, mode="valid"); lag = int(np.argmax(c)); score = float(c[lag])
    LAG[P] = (lag / 1000.0, score)
    print(P, "speech offset in clip", round(lag / 1000.0, 3), "corr", round(score, 3), flush=True)

# ---------- 3. word timings (clean VO wavs) ----------
def fake_words(k):
    txt = {"vo1": "hoje eu não vim vender uma casa vim te mostrar um palácio",
           "vo2": "século dezenove seis hectares murados no coração de sintra",
           "vo3": "capela própria salões com teto de palácio e uma escadaria que hoje ninguém mais constrói",
           "vo4": "piscina de trinta e três metros quadra de tênis pomares e bosque",
           "vo5": "e o projeto já está aprovado trinta e duas suítes hotel boutique ou casa de família você escolhe",
           "vo6": "dez minutos da praia grande e de cascais quarenta de lisboa",
           "vo7": "dezesseis milhões e meio de euros quer o dossiê completo comenta palácio que eu te mando"}[k].split()
    L = dur(f"src/{k}_t.wav") * 0.92; st = L / len(txt)
    return [(w, i * st, (i + 1) * st) for i, w in enumerate(txt)]
if SMOKE:
    WT = {k: fake_words(k) for k in list(BROLL_VO) + list(PRES.values())}
else:
    from faster_whisper import WhisperModel
    wm = WhisperModel("small", device="cpu", compute_type="int8")
    def words(audio):
        segs, _ = wm.transcribe(audio, language="pt", word_timestamps=True, beam_size=5)
        return [(re.sub(r"[^\wÀ-ÿ€,.]", "", w.word.strip().lower()), w.start, w.end) for s in segs for w in s.words]
    WT = {k: words(f"src/{k}_t.wav") for k in list(BROLL_VO) + list(PRES.values())}
json.dump(WT, open(f"{OUT}/words.json", "w"), ensure_ascii=False, indent=1)
for k in PRES.values():                      # presenter line length = last word end (+ tail)
    VO[k] = (max(w[2] for w in WT[k]) + 0.12) if WT[k] else dur(f"src/{k}_t.wav") - 0.3
print("VO", {k: round(v, 2) for k, v in VO.items()}, flush=True)

# ---------- 4. shot builders ----------
NORM = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
GRADE = "eq=contrast=1.07:saturation=1.12:brightness=0.004,unsharp=3:3:0.35"
def radial(strength=0.10, taps=5):
    parts = [f"split={taps}" + "".join(f"[r{i}]" for i in range(taps))]
    for i in range(taps):
        z = 1 + strength * i / (taps - 1)
        parts.append(f"[r{i}]scale=iw*{z:.4f}:ih*{z:.4f},crop={W}:{H}[z{i}]")
    parts.append("".join(f"[z{i}]" for i in range(taps)) + f"mix=inputs={taps}")
    return ";".join(parts)

def seg(src, t_in, src_len, speed, tmix, out_len, radial_strength=0.0):
    vf = [f"trim=start={t_in:.3f}:duration={src_len:.3f}", "setpts=PTS-STARTPTS"]
    if speed != 1.0: vf.append(f"setpts={1/speed:.5f}*PTS")
    vf.append(NORM)
    if tmix > 1: vf.append(f"tmix=frames={tmix}")
    vf.append(f"fps={FPS}")
    chain = ",".join(vf)
    if radial_strength > 0: chain += "," + radial(radial_strength)
    chain += f",{GRADE},setsar=1,format=yuv420p,trim=duration={out_len:.3f},setpts=PTS-STARTPTS"
    return chain

SKIP_SHOTS = os.environ.get("SKIP_SHOTS") == "1"
def cached(out, length):
    if SKIP_SHOTS: return True
    return os.path.exists(out) and abs(dur(out) - length) < 0.07

def ramp_shot(name, src, t_in, length, fast=3.6, ramp=0.42, radial_strength=0.12, speed_rest=1.15):
    """Hyperlapse-style shot: fast blurred entry that decelerates to near real time."""
    out = f"{OUT}/{name}.mp4"
    if cached(out, length): print(name, "cached"); return out
    srcdur = dur(src)
    a_out = ramp * 0.6; b_out = ramp * 0.4; c_out = length - ramp
    a_src = a_out * fast; b_src = b_out * (fast * 0.5); c_src = c_out * speed_rest
    need = a_src + b_src + c_src
    if t_in + need > srcdur - 0.05:                      # not enough source: slow the tail down
        c_src = max(0.2, srcdur - 0.05 - t_in - a_src - b_src); speed_rest = c_src / c_out
    t_b = t_in + a_src; t_c = t_b + b_src
    fc = (f"[0:v]{seg(src, t_in, a_src, fast, 6, a_out, radial_strength)}[sa];"
          f"[0:v]{seg(src, t_b, b_src, fast*0.5, 3, b_out, radial_strength*0.4)}[sb];"
          f"[0:v]{seg(src, t_c, c_src, speed_rest, 2, c_out)}[sc];"
          f"[sa][sb][sc]concat=n=3:v=1:a=0,settb=AVTB[v]")
    open("fc_shot.txt", "w").write(fc)
    sh(f"ffmpeg -v error -y -i '{src}' -filter_complex_script fc_shot.txt -map '[v]' -t {length} -c:v libx264 -preset fast -crf 15 -r {FPS} '{out}'")
    print(name, "->", round(dur(out), 2), flush=True); return out

def plain_shot(name, src, t_in, length, speed=1.0, tmix=1, push=0.0):
    out = f"{OUT}/{name}.mp4"
    if cached(out, length): print(name, "cached"); return out
    vf = seg(src, t_in, length * speed, speed, tmix, length)
    if push > 0:
        n = int(length * FPS)
        vf += f",zoompan=z='1+{push:.4f}*on/{n}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},setsar=1"
    sh(f"ffmpeg -v error -y -i '{src}' -vf \"{vf}\" -t {length} -c:v libx264 -preset fast -crf 15 -r {FPS} '{out}'")
    print(name, "->", round(dur(out), 2), flush=True); return out

def presenter_shot(name, src, length, cuts):
    """cuts: list of (t_start, t_end, zoom, push) in clip time. Jump-cut punch-ins + slow pushes; no grade on skin."""
    out = f"{OUT}/{name}.mp4"
    if cached(out, length): print(name, "cached"); return out
    parts = []; labels = []
    for i, (t0, t1, z, push) in enumerate(cuts):
        n = max(1, int(round((t1 - t0) * FPS)))
        cz = f"crop=iw/{z:.4f}:ih/{z:.4f}:(iw-iw/{z:.4f})/2:(ih-ih/{z:.4f})*0.42,scale={W}:{H}" if z != 1.0 else "null"
        # impact shake on every jump cut after the first: 6 frames of decaying jitter (crash-zoom feel)
        shake = (f",scale={W+60}:{H+106},crop={W}:{H}:x='30+lt(n,6)*22*(1-n/6)*sin(n*2.9)':y='53+lt(n,6)*18*(1-n/6)*cos(n*2.3)'"
                 if i > 0 else "")
        parts.append(f"[0:v]trim=start={t0:.3f}:duration={t1-t0:.3f},setpts=PTS-STARTPTS,{NORM},{cz},"
                     f"zoompan=z='1+{push:.4f}*on/{n}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)*0.9':s={W}x{H}:fps={FPS},setsar=1{shake},"
                     f"trim=duration={t1-t0:.3f},setpts=PTS-STARTPTS[p{i}]")
        labels.append(f"[p{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(cuts)}:v=1:a=0,format=yuv420p,settb=AVTB[v]"
    open("fc_shot.txt", "w").write(fc)
    sh(f"ffmpeg -v error -y -i '{src}' -filter_complex_script fc_shot.txt -map '[v]' -t {length} -c:v libx264 -preset fast -crf 15 -r {FPS} '{out}'")
    print(name, "->", round(dur(out), 2), flush=True); return out

# ---------- 5. custom per-pixel transitions (xfade custom expressions) ----------
def plane_switch(fn):
    return "if(eq(PLANE,0),%s,if(eq(PLANE,1),%s,if(eq(PLANE,2),%s,%s)))" % (fn("a0", "b0"), fn("a1", "b1"), fn("a2", "b2"), fn("a3", "b3"))
E = "(P*P*(3-2*P))"
def whip_expr(direction=-1, taps=3, blur=0.09):
    def fn(a, b):
        S = f"({E}*W)"; R = f"(max(1,6*P*(1-P)*W*{blur}))"
        t = []
        for i in range(taps):
            d = f"({R}*{(i/(taps-1))*2-1:.2f})"
            if direction < 0:   # content slides left: A exits left, B enters from the right
                xa = f"clip(X+{S}+{d},0,W-1)"; xb = f"clip(X+{S}+{d}-W,0,W-1)"
                t.append(f"if(lt(X+{S}+{d},W),{a}({xa},Y),{b}({xb},Y))")
            else:
                xa = f"clip(X-{S}-{d},0,W-1)"; xb = f"clip(X-{S}-{d}+W,0,W-1)"
                t.append(f"if(gte(X-{S}-{d},0),{a}({xa},Y),{b}({xb},Y))")
        return "(" + "+".join(t) + f")/{taps}"
    return plane_switch(fn)
def zoom_expr(taps=3, amount=0.75, blur=0.045):
    def fn(a, b):
        za = f"(1+{E}*{amount})"; zb = f"(1+(1-{E})*{amount*0.6})"
        ta = []; tb = []
        for i in range(taps):
            k = 1 + blur * i
            ta.append(f"{a}(clip(W/2+(X-W/2)/({za}*{k:.3f}),0,W-1),clip(H/2+(Y-H/2)/({za}*{k:.3f}),0,H-1))")
            tb.append(f"{b}(clip(W/2+(X-W/2)/({zb}*{k:.3f}),0,W-1),clip(H/2+(Y-H/2)/({zb}*{k:.3f}),0,H-1))")
        return f"((1-{E})*(({'+'.join(ta)})/{taps})+{E}*(({'+'.join(tb)})/{taps}))"
    return plane_switch(fn)
def vwhip_expr(direction=-1, taps=3, blur=0.07):
    """vertical whip: content slides up (direction<0, B enters from below) or down."""
    def fn(a, b):
        S = f"({E}*H)"; R = f"(max(1,6*P*(1-P)*H*{blur}))"
        t = []
        for i in range(taps):
            d = f"({R}*{(i/(taps-1))*2-1:.2f})"
            if direction < 0:
                ya = f"clip(Y+{S}+{d},0,H-1)"; yb = f"clip(Y+{S}+{d}-H,0,H-1)"
                t.append(f"if(lt(Y+{S}+{d},H),{a}(X,{ya}),{b}(X,{yb}))")
            else:
                ya = f"clip(Y-{S}-{d},0,H-1)"; yb = f"clip(Y-{S}-{d}+H,0,H-1)"
                t.append(f"if(gte(Y-{S}-{d},0),{a}(X,{ya}),{b}(X,{yb}))")
        return "(" + "+".join(t) + f")/{taps}"
    return plane_switch(fn)
def spin_expr(taps=2, angle=1.2, zoom=0.45, dblur=0.05):
    """rotational whip: A spins out (zooming in), B spins in from the opposite side; taps blur along the rotation."""
    def fn(a, b):
        def rot(src, th, z):
            out = []
            for i in range(taps):
                dt = f"({th}+{(i/(taps-1))*2-1:.2f}*{dblur}*6*P*(1-P))"
                xs = f"clip(W/2+((X-W/2)*cos({dt})-(Y-H/2)*sin({dt}))/({z}),0,W-1)"
                ys = f"clip(H/2+((X-W/2)*sin({dt})+(Y-H/2)*cos({dt}))/({z}),0,H-1)"
                out.append(f"{src}({xs},{ys})")
            return "((" + "+".join(out) + f")/{taps})"
        A = rot(a, f"({E}*{angle})", f"(1+{E}*{zoom})")
        Bq = rot(b, f"(({E}-1)*{angle})", f"(1+(1-{E})*{zoom})")
        return f"((1-{E})*{A}+{E}*{Bq})"
    return plane_switch(fn)
# (expr, duration, kind)  kind: 'custom' | 'builtin'
TRANS = {"whipL": (whip_expr(-1), 0.22), "whipR": (whip_expr(+1), 0.22),
         "whipU": (vwhip_expr(-1), 0.22), "whipD": (vwhip_expr(+1), 0.22),
         "zoom": (zoom_expr(), 0.28), "spin": (spin_expr(), 0.30),
         "flash": ("fadewhite", 0.14), "hard": (None, 0.0)}
BUILTIN = {"flash"}

# ---------- 6. shot list ----------
shots = []
def add(name, path, length, trans): shots.append({"name": name, "path": path, "len": length, "trans": trans})
CUTIN = 0.9                                                 # b-roll cut-in inside the salon block
GAP_P2 = TRANS["zoom"][1] + TRANS["whipL"][1]               # overlap eaten by the two transitions around it

def blk(D, fracs, transes):
    """shot lengths for one VO block: each shot owns frac*D of timeline plus the overlap its own transition eats."""
    return [round(f * D + TRANS[t][1], 2) for f, t in zip(fracs, transes)]

# B1 hook — presenter at the gate
P1L = min(dur("src/P1_t.mp4"), LAG["P1"][0] + VO["vo1"] + 0.5)
pz = min(2.4, P1L * 0.6)
add("s01", presenter_shot("s01_P1", "src/P1_t.mp4", P1L, [(0.0, pz, 1.0, 0.05), (pz, P1L, 1.13, 0.04)]), P1L, "hard")
# B2 estate (VO2): FPV through the gate -> garden orbit -> low-angle facade with sun flare
T2 = ["hard", "whipU", "spin"]; L2 = blk(VO["vo2"] + 0.35, [0.36, 0.30, 0.34], T2); L2[2] += 0.40
add("s02", plain_shot("s02_c83", "src/c83.mp4", 0.0, L2[0], speed=1.35, tmix=3), L2[0], T2[0])
add("s03", plain_shot("s03_c79", "src/c79.mp4", 0.0, L2[1], speed=1.5, tmix=3), L2[1], T2[1])
add("s04", plain_shot("s04_c82", "src/c82.mp4", 0.0, L2[2], speed=1.2, tmix=2), L2[2], T2[2])
# B3 interiors (VO3): chapel rush -> corridor hyperlapse -> salon ramp -> stair tilt -> spiral orbit
T3 = ["zoom", "whipL", "flash", "whipD", "whipR"]; L3 = blk(VO["vo3"] + 0.3, [0.22, 0.20, 0.20, 0.19, 0.19], T3)
add("s05", plain_shot("s05_c71", "src/c71.mp4", 0.0, L3[0], speed=1.3, tmix=3), L3[0], T3[0])
add("s06", plain_shot("s06_c84", "src/c84.mp4", 0.0, L3[1], speed=1.6, tmix=4), L3[1], T3[1])
add("s07", ramp_shot("s07_b105", "src/b105.mp4", 0.0, L3[2]), L3[2], T3[2])
add("s08", plain_shot("s08_c78", "src/c78.mp4", 0.0, L3[3], speed=1.3, tmix=3), L3[3], T3[3])
add("s09", plain_shot("s09_c72", "src/c72.mp4", 0.0, L3[4], speed=1.5, tmix=3), L3[4], T3[4])
# B4 grounds (VO4): top-down pool orbit -> pool pull-back -> tennis tracking -> plane-tree avenue ramp
T4 = ["zoom", "whipU", "whipR", "whipL"]; L4 = blk(VO["vo4"] + 0.3, [0.30, 0.25, 0.25, 0.20], T4)
add("s10", plain_shot("s10_c81", "src/c81.mp4", 0.0, L4[0], speed=1.3, tmix=2), L4[0], T4[0])
add("s11", ramp_shot("s11_c73", "src/c73.mp4", 0.0, L4[1], fast=3.0), L4[1], T4[1])
add("s12", ramp_shot("s12_c75", "src/c75.mp4", 0.0, L4[2], fast=3.2), L4[2], T4[2])
add("s13", ramp_shot("s13_b109", "src/b109.mp4", 0.0, L4[3]), L4[3], T4[3])
# B5 presenter in the salon (VO5) with a b-roll cut-in that REPLACES clip time (audio stays continuous)
P2L = min(dur("src/P2_t.mp4"), LAG["P2"][0] + VO["vo5"] + 0.45)
c1 = round(P2L * 0.36, 2); c2 = round(P2L * 0.66, 2); r1 = round(c1 + CUTIN - GAP_P2, 2)
add("s14", presenter_shot("s14_P2a", "src/P2_t.mp4", c1, [(0.0, c1, 1.0, 0.06)]), c1, "zoom")
add("s15", ramp_shot("s15_cut_b107", "src/b107.mp4", 0.0, CUTIN, fast=3.0, ramp=0.3), CUTIN, "whipL")
add("s16", presenter_shot("s16_P2b", "src/P2_t.mp4", P2L - r1, [(r1, c2, 1.14, 0.03), (c2, P2L, 1.0, 0.06)]), P2L - r1, "whipR")
# B6 location (VO6): courtyard whip-pan -> turret crash zoom -> lily-pond dive
T6 = ["whipL", "flash", "whipD"]; L6 = blk(VO["vo6"] + 0.3, [0.36, 0.34, 0.30], T6)
add("s17", ramp_shot("s17_c74", "src/c74.mp4", 0.0, L6[0], fast=3.0), L6[0], T6[0])
add("s18", plain_shot("s18_c77", "src/c77.mp4", 0.0, L6[1], speed=1.2, tmix=2), L6[1], T6[1])
add("s19", ramp_shot("s19_c76", "src/c76.mp4", 0.0, L6[2], fast=2.6), L6[2], T6[2])
# B7 CTA presenter (VO7)
P3L = min(dur("src/P3_t.mp4"), LAG["P3"][0] + VO["vo7"] + 0.5)
d1 = round(P3L * 0.40, 2); d2 = round(P3L * 0.68, 2)
add("s20", presenter_shot("s20_P3", "src/P3_t.mp4", P3L, [(0.0, d1, 1.0, 0.04), (d1, d2, 1.09, 0.0), (d2, P3L, 1.0, 0.03)]), P3L, "zoom")
# end card
add("s21", plain_shot("s21_end", "src/c81.mp4", 2.0, 1.9, speed=0.7, push=0.06), 1.9, "whipU")

# ---------- 7. assemble ----------
starts = []; t = 0.0
for i, s in enumerate(shots):
    if i == 0: starts.append(0.0); t = s["len"]; continue
    _, d = TRANS[s["trans"]]; st = t - d; starts.append(st); t = st + s["len"]
TOTAL = t
print("starts", [round(x, 2) for x in starts], "TOTAL", round(TOTAL, 2), flush=True)
inputs = " ".join(f"-i '{s['path']}'" for s in shots)
fc = [f"[{i}:v]fps={FPS},format=yuv420p,settb=AVTB[i{i}]" for i in range(len(shots))]
prev = "[i0]"; acc = shots[0]["len"]
for i in range(1, len(shots)):
    kind, d = TRANS[shots[i]["trans"]]; lbl = f"[v{i}]"
    if kind is None:
        fc.append(f"{prev}[i{i}]concat=n=2:v=1:a=0,settb=AVTB{lbl}"); acc += shots[i]["len"]
    else:
        off = acc - d
        if shots[i]["trans"] in BUILTIN:
            fc.append(f"{prev}[i{i}]xfade=transition={kind}:duration={d}:offset={off:.3f},settb=AVTB{lbl}")
        else:
            fc.append(f"{prev}[i{i}]xfade=transition=custom:expr='{kind}':duration={d}:offset={off:.3f},settb=AVTB{lbl}")
        acc = off + shots[i]["len"]
    prev = lbl
fc.append(f"{prev}format=yuv420p[vout]")
open("fc.txt", "w").write(";\n".join(fc))
if not cached(f"{OUT}/video_clean.mp4", TOTAL):
    sh(f"ffmpeg -v error -y {inputs} -filter_complex_script fc.txt -map '[vout]' -c:v libx264 -preset medium -crf 15 -r {FPS} {OUT}/video_clean.mp4")
print("video_clean", round(dur(f"{OUT}/video_clean.mp4"), 2), flush=True)
if os.environ.get("STAGE") == "A":
    json.dump({"starts": [float(x) for x in starts], "total": float(TOTAL)}, open(f"{OUT}/stageA.json", "w")); print("STAGE A DONE"); raise SystemExit(0)

# ---------- 8. timing helpers ----------
def S(n): return starts[[s["name"] for s in shots].index(n)]
BLK = {"vo1": S("s01") + LAG["P1"][0], "vo2": S("s02") + 0.12, "vo3": S("s05") + 0.10, "vo4": S("s10") + 0.10,
       "vo5": S("s14") + LAG["P2"][0], "vo6": S("s17") + 0.10, "vo7": S("s20") + LAG["P3"][0]}
def tw(track, key, frac, nth=0):
    hits = [w for w in WT[track] if w[0].startswith(key)]
    if len(hits) > nth: return BLK[track] + hits[nth][1]
    return BLK[track] + frac * VO[track]
def tend(track, key, frac, nth=0):
    hits = [w for w in WT[track] if w[0].startswith(key)]
    if len(hits) > nth: return BLK[track] + hits[nth][2]
    return BLK[track] + frac * VO[track]

# ---------- 9. kinetic typography (ASS) ----------
from PIL import ImageFont
MAXW = 1000
def textw(txt, fontfile, size, spacing):
    try: f = ImageFont.truetype(fontfile, int(size)); w = f.getlength(txt)
    except Exception: w = 0.6 * size * len(txt)
    return w + spacing * max(0, len(txt) - 1)
def fit(txt, fontfile, size, spacing, allow_wrap=False, maxw=MAXW):
    """returns (ass_text, fontsize) that fits inside maxw; wraps long secondary lines into two."""
    w = textw(txt, fontfile, size, spacing)
    if w <= maxw: return txt, size
    if allow_wrap and " " in txt and w > maxw * 1.25:
        words = txt.split(" "); best = None
        for i in range(1, len(words)):
            a, b = " ".join(words[:i]), " ".join(words[i:])
            ww = max(textw(a, fontfile, size, spacing), textw(b, fontfile, size, spacing))
            if best is None or ww < best[0]: best = (ww, a, b)
        ww, a, b = best; s2 = size if ww <= maxw else size * maxw / ww
        return a + "\\N" + b, int(s2)
    return txt, int(size * maxw / w)

def ts(t):
    t = max(0.0, t); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
YEL = "&H42E3F5&"; WHT = "&HFFFFFF&"
SIZES = {"Key": 230, "Huge": 330, "Sub": 120}; SPC = {"Key": -10, "Huge": -14, "Sub": -2}
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Key,{KEYFONT},230,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,100,100,-10,0,1,0,7,5,40,40,40,1
Style: Huge,{KEYFONT},330,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,100,100,-14,0,1,0,9,5,40,40,40,1
Style: Sub,{SUBFONT},120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,100,100,-2,0,1,0,5,5,40,40,40,1
Style: Cap,Montserrat ExtraBold,88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,1,4,5,2,70,70,500,1
Style: Flash,{KEYFONT},20,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
def lockup(t0, t1, key, sub=None, x=540, y=760, keystyle="Key", color=WHT, subcolor=WHT, layer=1):
    """two-tier lockup: key word pops with blur+overshoot, secondary fades in under it; both blur out."""
    if t1 <= t0 + 0.2: t1 = t0 + 0.2
    d = t1 - t0; dm = int(d * 1000)
    key_txt, kfs = fit(key, KEYFILE, SIZES[keystyle], SPC[keystyle])
    rot = -5 if (x < 540) else (5 if x > 540 else -3)
    fx_in = f"\\fscx128\\fscy128\\frz{rot}\\blur22\\alpha&H70&\\t(0,120,0.55,\\fscx100\\fscy100\\frz0\\blur0\\alpha&H00&)"
    hold = f"\\t(120,{max(130, dm-110)},\\fscx104\\fscy104)"
    fx_out = f"\\t({max(130, dm-110)},{dm},\\blur14\\alpha&HFF&\\fscx112\\fscy112)"
    ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},{keystyle},,0,0,0,,{{\\an5\\pos({x},{y})\\fs{kfs}\\c{color}{fx_in}{hold}{fx_out}}}{key_txt}")
    if sub:
        sub_txt, sfs = fit(sub, SUBFILE, SIZES["Sub"], SPC["Sub"], allow_wrap=True)
        yy = y + kfs * 0.5 + sfs * (0.95 if "\\N" in sub_txt else 0.62) + 30
        s_in = f"\\fscx100\\fscy100\\blur16\\alpha&HFF&\\t(60,200,0.6,\\blur0\\alpha&H00&)"
        ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},Sub,,0,0,0,,{{\\an5\\pos({x},{int(yy)})\\fs{sfs}\\c{subcolor}{s_in}{fx_out}}}{sub_txt}")
def cap(t0, t1, text):
    if t1 <= t0 + 0.2: t1 = t0 + 0.2
    ev.append(f"Dialogue: 2,{ts(t0)},{ts(t1)},Cap,,0,0,0,,{{\\an2\\fscx86\\fscy86\\t(0,90,0.6,\\fscx100\\fscy100)\\fad(40,70)}}{text}")
def lightleak(t0, d=0.7, side=1, color="&H58C8FF&"):
    """sun-flare light leak: three stacked soft ellipses sweep across the frame and fade (libass blur)."""
    x0 = -300 if side > 0 else W + 300; x1 = W + 300 if side > 0 else -300
    for i, (r, a0, bl) in enumerate([(620, "&H60&", 120), (380, "&H40&", 80), (170, "&H20&", 40)]):
        ev.append(f"Dialogue: {4+i},{ts(t0)},{ts(t0+d)},Flash,,0,0,0,,{{\\an5\\move({x0},{700+i*60},{x1},{900-i*80})\\blur{bl}\\c{color}\\alpha&HFF&\\t(0,{int(d*300)},\\alpha{a0})\\t({int(d*300)},{int(d*1000)},\\alpha&HFF&)\\p1}}m 0 0 b {r} -{int(r*0.55)} {r} {int(r*0.55)} 0 0 m 0 0 b -{r} -{int(r*0.55)} -{r} {int(r*0.55)} 0 0{{\\p0}}")
def flash(t0, strength="&H40&"):
    ev.append(f"Dialogue: 3,{ts(t0)},{ts(t0+0.14)},Flash,,0,0,0,,{{\\an7\\pos(0,0)\\alpha{strength}\\t(0,140,\\alpha&HFF&)\\p1}}m 0 0 l {W} 0 {W} {H} 0 {H}{{\\p0}}")

# B1 — hook
lockup(tw("vo1","hoje",0.0), tw("vo1","vim",0.22), "hoje", None, 540, 640)
lockup(tw("vo1","não",0.12), tw("vo1","vender",0.36), "não vim", None, 480, 1180)
lockup(tw("vo1","vender",0.36), tw("vo1","vim",0.55,1), "vender", "uma casa", 560, 620, color=YEL)
lockup(tw("vo1","vim",0.55,1), tw("vo1","pal",0.78), "vim te", "mostrar", 470, 1200)
lockup(tw("vo1","pal",0.78), S("s02") + 0.25, "PALÁCIO", None, 540, 1150, keystyle="Huge"); flash(tw("vo1","pal",0.78))
# B2 — estate
lockup(tw("vo2","século",0.0), tw("vo2","seis",0.4), "século", "XIX", 540, 700)
lockup(tw("vo2","seis",0.4), tw("vo2","sintra",0.75), "6 hectares", "murados", 540, 1180, color=YEL)
lockup(tw("vo2","sintra",0.75), S("s05") + 0.1, "SINTRA", None, 540, 760, keystyle="Huge")
# B3 — interiors
lockup(tw("vo3","capela",0.0), tw("vo3","sal",0.3), "capela", "própria", 540, 640)
lockup(tw("vo3","sal",0.3), tw("vo3","escad",0.6), "salões", "teto de palácio", 540, 1180)
lockup(tw("vo3","escad",0.6), tend("vo3","constr",0.98), "escadaria", "que ninguém mais constrói", 540, 700, color=YEL)
# B4 — grounds
lockup(tw("vo4","piscina",0.0), tw("vo4","quadra",0.45), "33 m", "de piscina", 540, 640, keystyle="Huge", color=YEL); flash(tw("vo4","piscina",0.0)+0.25)
lockup(tw("vo4","quadra",0.45), tw("vo4","pomar",0.72), "tênis", None, 540, 1180)
lockup(tw("vo4","pomar",0.72), S("s14") + 0.1, "pomares", "e bosque", 540, 760)
# B5 — presenter captions + number lockup
cap(BLK["vo5"] + 0.05, tw("vo5","trinta",0.33), "e o projeto já está {\\c&H42E3F5&}aprovado")
lockup(tw("vo5","trinta",0.33), tw("vo5","hotel",0.56), "32", "suítes", 540, 560, keystyle="Huge", color=YEL); flash(tw("vo5","trinta",0.33))
cap(tw("vo5","hotel",0.56), tw("vo5","você",0.85), "hotel boutique ou casa de família")
cap(tw("vo5","você",0.85), S("s17") + 0.1, "{\\c&H42E3F5&}você escolhe!")
# B6 — location
lockup(tw("vo6","dez",0.0), tw("vo6","cascais",0.45), "10 min", "Praia Grande", 540, 640, color=YEL)
lockup(tw("vo6","cascais",0.45), tw("vo6","quarenta",0.68), "Cascais", None, 540, 1180)
lockup(tw("vo6","quarenta",0.68), S("s20") + 0.1, "40 min", "Lisboa", 540, 700, keystyle="Huge")
# B7 — CTA
lockup(tw("vo7","dezesseis",0.0), tw("vo7","quer",0.42), "16,5 M€", None, 540, 560, keystyle="Huge", color=YEL); flash(tw("vo7","dezesseis",0.0))
cap(tw("vo7","quer",0.42), tw("vo7","comenta",0.62), "quer o dossiê completo?")
lockup(tw("vo7","comenta",0.62), S("s21") + 0.1, "comenta", "PALÁCIO", 540, 1120, subcolor=YEL)
# light leaks on the big beats (sun-flare feel of the reference)
lightleak(S("s02") - 0.1, 0.8, +1); lightleak(S("s04") + 0.05, 0.9, -1); lightleak(S("s10") - 0.1, 0.8, +1)
lightleak(S("s17") - 0.05, 0.7, -1); lightleak(S("s21") - 0.1, 0.9, +1)
# end card
e0 = S("s21") + 0.25
_, hfs = fit("PALÁCIO", KEYFILE, 330, -14)
ev.append(f"Dialogue: 2,{ts(e0)},{ts(TOTAL)},Huge,,0,0,0,,{{\\an5\\pos(540,820)\\fs{hfs}\\fad(120,250)\\fscx90\\fscy90\\t(0,900,\\fscx100\\fscy100)}}PALÁCIO")
ev.append(f"Dialogue: 2,{ts(e0+0.12)},{ts(TOTAL)},Key,,0,0,0,,{{\\an5\\pos(540,1060)\\fs200\\fad(120,250)\\c{YEL}}}SINTRA")
ev.append(f"Dialogue: 2,{ts(e0+0.25)},{ts(TOTAL)},Sub,,0,0,0,,{{\\an5\\pos(540,1260)\\fad(120,250)\\fs64}}B.S.C.  ·  comenta PALÁCIO")
open(f"{OUT}/typo.ass", "w", encoding="utf-8").write(hdr + "\n".join(ev) + "\n")
ca = []
for i, sdef in enumerate(shots):
    if i == 0: continue
    tr = sdef["trans"]; d = TRANS[tr][1]; t0 = starts[i]
    if tr in ("whipL", "whipR"): ca.append(f"rgbashift=rh=-9:bh=9:enable='between(t,{t0-0.02:.3f},{t0+d+0.02:.3f})'")
    elif tr in ("whipU", "whipD"): ca.append(f"rgbashift=rv=-9:bv=9:enable='between(t,{t0-0.02:.3f},{t0+d+0.02:.3f})'")
    elif tr in ("spin", "zoom"): ca.append(f"rgbashift=rh=-6:rv=-6:bh=6:bv=6:enable='between(t,{t0-0.02:.3f},{t0+d+0.02:.3f})'")
vf = ",".join(ca + [f"subtitles={OUT}/typo.ass:fontsdir={FONTDIR}"])
open("vf_typo.txt", "w").write(vf)
sh(f"ffmpeg -v error -y -i {OUT}/video_clean.mp4 -filter_script:v vf_typo.txt -c:v libx264 -preset medium -crf 15 -r {FPS} {OUT}/video_typo.mp4")

# ---------- 10. audio: voice + whooshes + ducked music ----------
tr = [(f"src/{k}_t.wav", BLK[k]) for k in ("vo1", "vo2", "vo3", "vo4", "vo5", "vo6", "vo7")]
whoosh_t = [starts[i] - 0.05 for i, s in enumerate(shots) if i > 0 and s["trans"] != "hard"]
ins = " ".join(f"-i '{p}'" for p, _ in tr); n = len(tr); f = []
for i, (p, st) in enumerate(tr):
    f.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={int(st*1000)}|{int(st*1000)}[a{i}]")
f.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0:dropout_transition=0,highpass=f=80,acompressor=threshold=-16dB:ratio=3:attack=6:release=120:makeup=2,alimiter=limit=0.95,apad=whole_dur={TOTAL+0.2}[voice]")
wl = []
for j, wt in enumerate(whoosh_t):
    f.append(f"anoisesrc=d=0.36:c=pink:r=48000:a=0.9:s={1000+j},aformat=channel_layouts=stereo,highpass=f=500,lowpass=f=7000,afade=t=in:d=0.07,afade=t=out:st=0.09:d=0.27,volume=0.42,adelay={int(wt*1000)}|{int(wt*1000)}[w{j}]")
    wl.append(f"[w{j}]")
f.append("".join(wl) + f"amix=inputs={len(wl)}:normalize=0:dropout_transition=0,apad=whole_dur={TOTAL+0.2}[sfx]")
md = dur("src/music.mp3"); tempo = min(1.0, max(0.85, md / (TOTAL + 0.4)))
f.append(f"[{n}:a]aformat=sample_rates=48000:channel_layouts=stereo,atempo={tempo:.4f},atrim=0:{TOTAL+0.5},afade=t=in:d=0.3,afade=t=out:st={TOTAL-0.7}:d=0.7,volume=0.36[mus]")
f.append("[voice]asplit[vmix][vkey]")
f.append("[mus][vkey]sidechaincompress=threshold=0.05:ratio=6:attack=12:release=300:makeup=1[musduck]")
f.append("[vmix][sfx][musduck]amix=inputs=3:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=8[aout]")
open("fa.txt", "w").write(";\n".join(f))
sh(f"ffmpeg -v error -y {ins} -i src/music.mp3 -filter_complex_script fa.txt -map '[aout]' -t {TOTAL} -ar 48000 -c:a aac -b:a 256k {OUT}/mix.m4a")
sh(f"ffmpeg -v error -y -i {OUT}/video_typo.mp4 -i {OUT}/mix.m4a -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest {OUT}/final.mp4")

# ---------- 11. QA ----------
r = sh(f"ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of csv=p=0 {OUT}/final.mp4")
print("final.mp4", r.stdout.strip().replace("\n", " | "))
times = [t for t in [0.3, 1.0, 1.8, 2.7, 3.6, 4.4, 5.3, 6.4, 7.4, 8.6, 9.6, 10.8, 12.0, 13.2, 14.6, 16.0, 17.4, 18.8, 20.4, 22.0, 23.6, 25.2, 26.8, 28.4, 30.0, 31.6, 33.2, 34.8, 36.2, TOTAL-0.3] if t < TOTAL]
sel = "+".join(f"eq(n\\,{int(round(t*FPS))})" for t in times)
sh(f"ffmpeg -v error -y -i {OUT}/final.mp4 -vf \"select='{sel}',scale=216:-1,tile=6x5\" -vsync vfr -frames:v 1 -q:v 4 {OUT}/qa_sheet.jpg")
json.dump({"starts": dict(zip([s["name"] for s in shots], [round(x, 3) for x in starts])), "total": round(TOTAL, 3),
           "blk": {k: round(v, 3) for k, v in BLK.items()}, "vo": {k: round(v, 3) for k, v in VO.items()},
           "lag": {k: [round(v[0], 3), round(v[1], 3)] for k, v in LAG.items()}}, open(f"{OUT}/timeline.json", "w"), indent=1)
print("DONE total", round(TOTAL, 2))
