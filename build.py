#!/usr/bin/env python3
"""Palácio Sintra — Ronan BSC ad. Full assembly: cuts, speed ramps, whip/zoom
transitions, kinetic typography (ASS/libass), voice + music mix, QA frames."""
import json, os, re, subprocess, sys, shutil, math

W, H, FPS = 1080, 1920, 30
OUT = "out"; os.makedirs(OUT, exist_ok=True)
FONTDIR = "fonts"; os.makedirs(FONTDIR, exist_ok=True)
B = "https://d8j0ntlcm91z4.cloudfront.net/user_376XPpNiKYP0wVBJ1xS3f4v7M2A/"

SRC = {
 "P1": "hf_20261008_072919_9a3dfecc-8411-4481-8be4-3b6e049654c6.mp4",
 "P2": "hf_20261008_072918_95f2a11d-1a54-4514-89e5-c5cf3d93e44d.mp4",
 "P3": "hf_20261008_072954_b94c5400-7e6a-495c-8337-de51e2299a20.mp4",
 "b101": "hf_20261008_073153_395390d6-b409-45e5-80b4-7822caa9cf1b.mp4",
 "b102": "hf_20261008_073153_aa6c861f-90c4-4ee1-8aa4-1a4313e3349f.mp4",
 "b103": "hf_20261008_073153_c05d493b-3edb-4aa6-b61e-cc5b0537e9c1.mp4",
 "b104": "hf_20261008_073154_a57b1358-9062-407b-8f3e-bd62917ae1d6.mp4",
 "b105": "hf_20261008_073250_3245e7ee-22c7-40f2-aa67-4f33161280ff.mp4",
 "b107": "hf_20261008_073153_0800deb5-336c-472b-b463-ec57af9ab914.mp4",
 "b108": "hf_20261008_073153_40b49404-7619-4fc2-aa0f-677f69ba7f7e.mp4",
 "b109": "hf_20261008_073129_40f6c174-beb4-46cd-ab34-d149171fabef.mp4",
 "b112": "hf_20261008_073153_85f41041-42e7-4c9b-a017-dfeaa7c72a58.mp4",
 "b113": "hf_20261008_073155_735d982a-2de1-4b98-a79f-b0f10b7efe75.mp4",
 "vo2": "hf_20261008_071945_595edec5-f2e8-469a-8af8-5807ea634702.mp3",
 "vo3": "hf_20261008_071945_de151775-9117-4a77-bbc7-17d367cc0061.mp3",
 "vo4": "hf_20261008_072331_dbf38fe7-f009-4c0c-84f1-ab717183c8a4.mp3",
 "vo6": "hf_20261008_071952_8663652a-3579-4ced-960a-ba4f0b4e4cd0.mp3",
 "vo1": "hf_20261008_071945_e49794b5-a71f-4197-917e-7861ec1eca07.mp3",
 "vo5": "hf_20261008_071945_9f8a559b-a01c-4fcb-a548-db299b9a7c0b.mp3",
 "vo7": "hf_20261008_072331_93e782f8-09b7-4f8e-809c-ad4ce878834a.mp3",
}
EXTRA = json.load(open("extra.json")) if os.path.exists("extra.json") else {}
SRC.update(EXTRA.get("src", {}))
MUSIC_URL = EXTRA.get("music_url")

def sh(cmd, check=True):
    print("+", cmd[:300], flush=True)
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and r.returncode != 0:
        print(r.stderr[-3000:]); raise SystemExit("FAILED: " + cmd[:200])
    return r

def dur(f):
    r = sh(f"ffprobe -v error -show_entries format=duration -of csv=p=0 '{f}'")
    return float(r.stdout.strip())

# ---------- 1. download ----------
os.makedirs("src", exist_ok=True)
for k, v in SRC.items():
    dst = f"src/{k}" + os.path.splitext(v)[1]
    if not os.path.exists(dst) or os.path.getsize(dst) < 1000:
        url = v if v.startswith("http") else B + v
        sh(f"curl -sL --retry 3 -o '{dst}' '{url}'")
if MUSIC_URL:
    sh(f"curl -sL --retry 3 -o src/music.mp3 '{MUSIC_URL}'")
if not os.path.exists(f"{FONTDIR}/Anton-Regular.ttf"):
    sh(f"curl -sL -o {FONTDIR}/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf", check=False)
shutil.copy("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf", f"{FONTDIR}/Montserrat-ExtraBold.ttf")
HAVE_ANTON = os.path.exists(f"{FONTDIR}/Anton-Regular.ttf") and os.path.getsize(f"{FONTDIR}/Anton-Regular.ttf") > 50000
print("fonts ok, anton:", HAVE_ANTON)

# ---------- 2. normalise + per-shot treatment ----------
NORM = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
GRADE = "eq=contrast=1.06:saturation=1.10:brightness=0.005,unsharp=3:3:0.4"
def shot(name, src, t_in, length, speed=1.0, blur=False, grade=True):
    """Render one shot to a 30fps 1080x1920 silent mp4 of exact `length` seconds."""
    out = f"{OUT}/{name}.mp4"
    if os.path.exists(out) and os.path.getsize(out) > 1000 and abs(dur(out) - length) < 0.06:
        print(name, "cached"); return out
    src_len = length * speed
    vf = [f"trim=start={t_in}:duration={src_len}", "setpts=PTS-STARTPTS"]
    if speed != 1.0:
        vf.append(f"setpts={1/speed:.4f}*PTS")
    vf.append(NORM)
    if blur: vf.append("tblend=all_mode=average")
    vf.append(f"fps={FPS}")
    if grade: vf.append(GRADE)
    vf.append("format=yuv420p")
    sh(f"ffmpeg -v error -y -i '{src}' -an -vf \"{','.join(vf)}\" -t {length} -c:v libx264 -preset fast -crf 16 -r {FPS} '{out}'")
    d = dur(out); print(name, "->", round(d, 2))
    return out

shots = []  # (name, path, length, transition_in)
def add(name, src, t_in, length, speed=1.0, blur=False, trans="hard", grade=True):
    p = shot(name, src, t_in, length, speed, blur, grade)
    shots.append({"name": name, "path": p, "len": length, "trans": trans})

# Block 1 — hook (presenter at the gate)
add("s01_P1", "src/P1.mp4", 0.0, 5.00, trans="hard", grade=False)
# Block 2 — estate
add("s02_b101", "src/b101.mp4", 0.0, 2.50, trans="whip")
add("s03_b113", "src/b113.mp4", 0.3, 2.80, trans="whip")
# Block 3 — interiors hyperlapse (2x with frame blend)
add("s04_b104", "src/b104.mp4", 0.0, 1.50, speed=2.0, blur=True, trans="zoom")
add("s05_b105", "src/b105.mp4", 0.0, 1.50, speed=2.0, blur=True, trans="hard")
add("s06_b112", "src/b112.mp4", 0.0, 1.50, speed=2.0, blur=True, trans="hard")
add("s07_b107", "src/b107.mp4", 0.0, 1.60, speed=2.0, blur=True, trans="hard")
# Block 4 — pool, tennis, woods
add("s08_b103", "src/b103.mp4", 0.0, 2.90, trans="whip")
add("s09_b111", "src/b111.mp4", 0.0, 1.50, speed=1.5, trans="whip")
add("s10_b109", "src/b109.mp4", 0.0, 1.50, speed=1.5, trans="hard")
# Block 5 — presenter in the salon
add("s11_P2", "src/P2.mp4", 0.0, 8.00, trans="zoom", grade=False)
# Block 6 — gate, facade, lilies
add("s12_b108", "src/b108.mp4", 0.0, 2.00, trans="whip")
add("s13_b102", "src/b102.mp4", 0.0, 1.90, trans="whip")
add("s14_b110", "src/b110.mp4", 0.0, 2.00, trans="hard")
# Block 7 — presenter CTA at the pool
add("s15_P3", "src/P3.mp4", 0.0, 8.00, trans="zoom", grade=False)
# End card
add("s16_b106", "src/b106.mp4", 0.0, 2.60, speed=0.8, trans="whip")

TR = {"whip": ("hblur", 0.22), "zoom": ("zoomin", 0.30), "hard": (None, 0.0)}
have_zoom = "zoomin" in sh("ffmpeg -hide_banner -h filter=xfade").stdout
if not have_zoom: TR["zoom"] = ("smoothleft", 0.30)

# ---------- 3. assemble video with xfade chain ----------
starts = []  # timeline start of each shot (after overlaps)
t = 0.0
for i, s in enumerate(shots):
    if i == 0: starts.append(0.0); t = s["len"]; continue
    kind, d = TR[s["trans"]]
    st = t - d
    starts.append(st); t = st + s["len"]
TOTAL = t
print("timeline starts", [round(x, 2) for x in starts], "total", round(TOTAL, 2))

inputs = " ".join(f"-i '{s['path']}'" for s in shots)
fc = []
for i in range(len(shots)):
    fc.append(f"[{i}:v]fps={FPS},format=yuv420p,settb=AVTB[i{i}]")
prev = "[i0]"
acc = shots[0]["len"]
for i in range(1, len(shots)):
    kind, d = TR[shots[i]["trans"]]
    lbl = f"[v{i}]"
    if kind is None:
        fc.append(f"{prev}[i{i}]concat=n=2:v=1:a=0,settb=AVTB{lbl}")
        acc += shots[i]["len"]
    else:
        off = acc - d
        fc.append(f"{prev}[i{i}]xfade=transition={kind}:duration={d}:offset={off:.3f},settb=AVTB{lbl}")
        acc = off + shots[i]["len"]
    prev = lbl
fc.append(f"{prev}format=yuv420p[vout]")
with open("fc.txt", "w") as f: f.write(";\n".join(fc))
sh(f"ffmpeg -v error -y {inputs} -filter_complex_script fc.txt -map '[vout]' -c:v libx264 -preset medium -crf 15 -r {FPS} {OUT}/video_clean.mp4")
VD = dur(f"{OUT}/video_clean.mp4"); print("video_clean", round(VD, 2))

# ---------- 4. word timings (faster-whisper) ----------
from faster_whisper import WhisperModel
wm = WhisperModel("small", device="cpu", compute_type="int8")
def words(audio):
    segs, _ = wm.transcribe(audio, language="pt", word_timestamps=True, beam_size=5)
    out = []
    for s in segs:
        for w in s.words:
            out.append((re.sub(r"[^\wÀ-ÿ€,.]", "", w.word.strip().lower()), w.start, w.end))
    return out
for p in ("P1", "P2", "P3"):
    sh(f"ffmpeg -v error -y -i src/{p}.mp4 -vn -ac 1 -ar 16000 src/{p}.wav")
WT = {k: words(f"src/{k}.wav" if k.startswith("P") else f"src/{k}.mp3") for k in ("P1", "P2", "P3", "vo2", "vo3", "vo4", "vo6")}
json.dump(WT, open(f"{OUT}/words.json", "w"), ensure_ascii=False, indent=1)

def S(name): return starts[[s["name"] for s in shots].index(name)]
BLOCK = {  # audio source -> timeline start
 "P1": S("s01_P1"), "vo2": S("s02_b101") + 0.15, "vo3": S("s04_b104") + 0.10,
 "vo4": S("s08_b103") + 0.10, "P2": S("s11_P2"), "vo6": S("s12_b108") + 0.10, "P3": S("s15_P3"),
}
def find(track, key, nth=0, default_frac=0.3):
    """timeline time of the nth word starting with key in that track"""
    hits = [w for w in WT[track] if w[0].startswith(key)]
    if len(hits) > nth: return BLOCK[track] + hits[nth][1]
    seglen = {"P1": 4.8, "vo2": 4.4, "vo3": 5.6, "vo4": 4.9, "P2": 8.0, "vo6": 4.8, "P3": 7.8}[track]
    return BLOCK[track] + default_frac * seglen

# ---------- 5. ASS typography ----------
def ts(t):
    t = max(0.0, t); h = int(t // 3600); m = int((t % 3600) // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"
YEL = r"\c&H42E3F5&"; WHT = r"\c&HFFFFFF&"
STACKFONT = "Anton" if HAVE_ANTON else "Montserrat ExtraBold"
STACK_FSCX = 100 if HAVE_ANTON else 88
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Stack,{STACKFONT},230,&H00FFFFFF,&H00FFFFFF,&H00000000,&H60000000,0,0,0,0,{STACK_FSCX},108,-4,0,1,0,6,7,60,60,60,1
Style: Big,{STACKFONT},330,&H00FFFFFF,&H00FFFFFF,&H00000000,&H60000000,0,0,0,0,{STACK_FSCX},112,-6,0,1,0,10,5,60,60,60,1
Style: Cap,Montserrat ExtraBold,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,5,2,70,70,560,1
Style: Small,Montserrat ExtraBold,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,2,0,1,2,3,2,80,80,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
def pop(x, y, t0, t1, text, style="Stack", layer=1, color=WHT, extra=""):
    """kinetic pop: scale 55->100 in 110 ms with overshoot, slight blur settle, fade out 120 ms"""
    anim = (f"{{\\an7\\pos({x},{y}){color}\\fscx55\\fscy55\\blur6\\alpha&H40&"
            f"\\t(0,110,\\fscx{STACK_FSCX+6}\\fscy114\\blur0\\alpha&H00&)\\t(110,190,\\fscx{STACK_FSCX}\\fscy108){extra}}}")
    ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},{style},,0,0,0,,{anim}{text}")
def cap(t0, t1, text, y=None):
    pos = f"\\pos(540,{y})" if y else ""
    ev.append(f"Dialogue: 2,{ts(t0)},{ts(t1)},Cap,,0,0,0,,{{\\an2{pos}\\fad(60,80)}}{text}")

# Block 1 — stacked hook words synced to P1 speech
b1_end = S("s02_b101") + 0.35
t_hoje = find("P1", "hoje"); t_nao = find("P1", "não", default_frac=0.22); t_vender = find("P1", "vender", default_frac=0.42)
t_pal = find("P1", "pal", default_frac=0.8)
pop(90, 240, t_hoje, b1_end, "hoje")
pop(90, 490, t_nao, b1_end, "não vim")
pop(90, 740, t_vender, b1_end, "vender casa", color=YEL)
pop(90, 990, t_pal, b1_end, "um palácio", style="Big")

# Block 2
b2_end = S("s04_b104") + 0.04
pop(90, 240, find("vo2", "século", default_frac=0.05), b2_end, "século XIX")
pop(90, 490, find("vo2", "seis", default_frac=0.35), b2_end, "6 hectares", color=YEL)
pop(90, 740, find("vo2", "sintra", default_frac=0.78), b2_end, "Sintra", style="Big")

# Block 3 — hyperlapse words
b3_end = S("s08_b103") + 0.04
pop(90, 240, find("vo3", "capela", default_frac=0.03), S("s05_b105") + 0.2, "capela")
pop(90, 240, find("vo3", "sal", default_frac=0.3), S("s06_b112") + 0.2, "salões")
pop(90, 240, find("vo3", "escad", default_frac=0.62), b3_end, "escadaria", color=YEL)
cap(find("vo3", "ningu", default_frac=0.8), b3_end, "que ninguém mais constrói")

# Block 4
b4_end = S("s11_P2") + 0.05
pop(90, 240, find("vo4", "piscina", default_frac=0.03), b4_end, "piscina")
pop(90, 470, find("vo4", "trinta", default_frac=0.22), b4_end, "33 m", style="Big", color=YEL)
pop(90, 880, find("vo4", "quadra", default_frac=0.5), b4_end, "tênis")
pop(90, 1130, find("vo4", "bosque", default_frac=0.85), b4_end, "bosque")

# Block 5 — presenter captions (yellow keywords)
b5_end = S("s12_b108") + 0.05
cap(BLOCK["P2"] + 0.05, find("P2", "trinta", default_frac=0.3), "e o projeto já está {\\c&H42E3F5&}aprovado")
cap(find("P2", "trinta", default_frac=0.3), find("P2", "hotel", default_frac=0.55), "{\\c&H42E3F5&}32 suítes")
cap(find("P2", "hotel", default_frac=0.55), find("P2", "você", default_frac=0.82), "hotel boutique ou casa de família")
cap(find("P2", "você", default_frac=0.82), b5_end, "{\\c&H42E3F5&}você escolhe.")

# Block 6
b6_end = S("s15_P3") + 0.30
pop(90, 240, find("vo6", "10", default_frac=0.05), b6_end, "10 min", color=YEL)
pop(90, 490, find("vo6", "praia", default_frac=0.25), b6_end, "Praia Grande")
pop(90, 740, find("vo6", "cascais", default_frac=0.5), b6_end, "Cascais")
pop(90, 990, find("vo6", "40", default_frac=0.72), b6_end, "40 min Lisboa", style="Big")

# Block 7 — CTA
b7_end = S("s16_b106") + 0.05
pop(90, 240, find("P3", "16", default_frac=0.02), find("P3", "quer", default_frac=0.42), "16,5 M€", style="Big", color=YEL)
cap(find("P3", "quer", default_frac=0.42), find("P3", "comenta", default_frac=0.62), "quer o dossiê completo?")
pop(90, 940, find("P3", "comenta", default_frac=0.62), b7_end, "comenta")
pop(90, 1180, find("P3", "pal", default_frac=0.75), b7_end, "PALÁCIO", style="Big", color=YEL)

# End card
e0 = S("s16_b106") + 0.3; e1 = TOTAL
ev.append(f"Dialogue: 2,{ts(e0)},{ts(e1)},Big,,0,0,0,,{{\\an5\\pos(540,820)\\fad(150,300)}}PALÁCIO")
ev.append(f"Dialogue: 2,{ts(e0+0.15)},{ts(e1)},Stack,,0,0,0,,{{\\an5\\pos(540,1040)\\fad(150,300)\\c&H42E3F5&}}SINTRA")
ev.append(f"Dialogue: 2,{ts(e0+0.3)},{ts(e1)},Small,,0,0,0,,{{\\an5\\pos(540,1260)\\fad(150,300)}}B.S.C.  ·  comenta PALÁCIO")
with open(f"{OUT}/typo.ass", "w", encoding="utf-8") as f: f.write(hdr + "\n".join(ev) + "\n")

sh(f"ffmpeg -v error -y -i {OUT}/video_clean.mp4 -vf \"subtitles={OUT}/typo.ass:fontsdir={FONTDIR}\" -c:v libx264 -preset medium -crf 15 -r {FPS} {OUT}/video_typo.mp4")

# ---------- 6. audio ----------
def adelay(ms): return f"adelay={ms}|{ms}"
voice_in = []; voice_f = []
tracks = [("src/P1.mp4", BLOCK["P1"]), ("src/vo2.mp3", BLOCK["vo2"]), ("src/vo3.mp3", BLOCK["vo3"]), ("src/vo4.mp3", BLOCK["vo4"]),
          ("src/P2.mp4", BLOCK["P2"]), ("src/vo6.mp3", BLOCK["vo6"]), ("src/P3.mp4", BLOCK["P3"])]
def mix(tracks, out, music=True):
    ins = " ".join(f"-i '{p}'" for p, _ in tracks)
    n = len(tracks); f = []
    for i, (p, st) in enumerate(tracks):
        f.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,{adelay(int(st*1000))}[a{i}]")
    f.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0:dropout_transition=0,highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,alimiter=limit=0.95,apad=whole_dur={TOTAL+0.2}[voice]")
    if music and os.path.exists("src/music.mp3"):
        ins += " -i src/music.mp3"
        md = dur("src/music.mp3"); tempo = min(1.0, max(0.85, md / (TOTAL + 0.25)))
        f.append(f"[{n}:a]aformat=sample_rates=48000:channel_layouts=stereo,atempo={tempo:.4f},atrim=0:{TOTAL+0.5},afade=t=in:d=0.8,afade=t=out:st={TOTAL-0.9}:d=0.9,volume=0.30[mus]")
        f.append("[voice]asplit[vmix][vkey]")
        f.append("[mus][vkey]sidechaincompress=threshold=0.05:ratio=6:attack=15:release=350:makeup=1[musduck]")
        f.append("[vmix][musduck]amix=inputs=2:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=9[aout]")
    else:
        f.append("[voice]loudnorm=I=-14:TP=-1.5:LRA=9[aout]")
    with open("fa.txt", "w") as fh: fh.write(";\n".join(f))
    sh(f"ffmpeg -v error -y {ins} -filter_complex_script fa.txt -map '[aout]' -t {TOTAL} -ar 48000 -c:a aac -b:a 256k '{out}'")
mix(tracks, f"{OUT}/mix.m4a")
sh(f"ffmpeg -v error -y -i {OUT}/video_typo.mp4 -i {OUT}/mix.m4a -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest {OUT}/final.mp4")
# alt version: ElevenLabs VO everywhere, aligned to measured speech offsets
alt = [("src/vo1.mp3", BLOCK["P1"] + 0.40), ("src/vo2.mp3", BLOCK["vo2"]), ("src/vo3.mp3", BLOCK["vo3"]), ("src/vo4.mp3", BLOCK["vo4"]),
       ("src/vo5.mp3", BLOCK["P2"] + 0.32), ("src/vo6.mp3", BLOCK["vo6"]), ("src/vo7.mp3", BLOCK["P3"] + 0.46)]
mix(alt, f"{OUT}/mix_alt.m4a")
sh(f"ffmpeg -v error -y -i {OUT}/video_typo.mp4 -i {OUT}/mix_alt.m4a -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest {OUT}/final_altvo.mp4")

# ---------- 7. QA ----------
for f in ("final.mp4", "final_altvo.mp4"):
    r = sh(f"ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of csv=p=0 {OUT}/{f}")
    print(f, r.stdout.strip().replace("\n", " | "))
times = [0.6, 1.9, 3.9, 5.5, 7.5, 9.8, 11.3, 13.0, 15.5, 17.5, 20.5, 24.0, 27.5, 29.5, 31.5, 34.5, 37.5, 40.5, 42.5, TOTAL - 0.4]
sel = "+".join(f"eq(n\\,{int(round(t*FPS))})" for t in times if t < TOTAL)
sh(f"ffmpeg -v error -y -i {OUT}/final.mp4 -vf \"select='{sel}',scale=216:-1,tile=5x4\" -vsync vfr -frames:v 1 -q:v 4 {OUT}/qa_sheet.jpg")
sh(f"ffmpeg -v error -y -i {OUT}/final.mp4 -ss 2.2 -frames:v 1 -vf scale=540:-1 -q:v 3 {OUT}/qa_f1.jpg")
sh(f"ffmpeg -v error -y -i {OUT}/final.mp4 -ss 36.6 -frames:v 1 -vf scale=540:-1 -q:v 3 {OUT}/qa_f2.jpg")
json.dump({"starts": dict(zip([s["name"] for s in shots], [round(x, 3) for x in starts])), "total": round(TOTAL, 3), "block": {k: round(v, 3) for k, v in BLOCK.items()}}, open(f"{OUT}/timeline.json", "w"), indent=1)
print("DONE total", round(TOTAL, 2))
