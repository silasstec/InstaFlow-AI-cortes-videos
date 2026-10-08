#!/bin/bash
cd /home/user/build
mkdir -p src fonts out2
echo "== start $(date)"; nproc; ffmpeg -version | head -1
curl -sL --retry 3 -o src/musicA.mp3 "$(python3 -c "import json;print(json.load(open('cfg2.json'))['music_url'])")"
curl -sL --retry 3 -o src/musicB.mp3 "$(python3 -c "import json;print(json.load(open('cfg2.json'))['music_url_b'])")"
ls -la src/music*.mp3
python3 - <<'PY'
from faster_whisper import WhisperModel
import shutil, os
wm = WhisperModel("small", device="cpu", compute_type="int8")
best=None
for k in ("A","B"):
    p=f"src/music{k}.mp3"
    if not (os.path.exists(p) and os.path.getsize(p)>10000): print(k,"missing", flush=True); continue
    segs,_=wm.transcribe(p, beam_size=1, vad_filter=False)
    txt=" ".join(s.text for s in segs); n=len(txt.split())
    print("music",k,"words",n,"|",txt[:160], flush=True)
    if best is None or n<best[0]: best=(n,k)
print("choose", best, flush=True); shutil.copy(f"src/music{best[1]}.mp3","src/music.mp3")
PY
python3 build2.py
echo "== end $(date) rc=$?"
