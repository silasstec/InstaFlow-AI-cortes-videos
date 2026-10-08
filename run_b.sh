#!/bin/bash
# Stage B: download video_clean -> music pick -> typo/audio/final -> PUT final + qa (urls in up_final.txt / up_qa.txt)
cd /home/user/build
mkdir -p src fonts out2
echo "== B start $(date)"
cp cfg3.json cfg2.json
curl -sL --retry 3 -o out2/video_clean.mp4 "$(cat clean_url.txt)"; ls -la out2/video_clean.mp4
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
SKIP_SHOTS=1 python3 build3.py
rc=$?; echo "== build rc=$rc $(date)"
ls -la out2/final.mp4 out2/qa_sheet.jpg
curl -sS -f -X PUT -H "Content-Type: video/mp4" --data-binary @out2/final.mp4 "$(cat up_final.txt)" -o /dev/null -w "PUT_FINAL http=%{http_code}\n"
curl -sS -f -X PUT -H "Content-Type: image/jpeg" --data-binary @out2/qa_sheet.jpg "$(cat up_qa.txt)" -o /dev/null -w "PUT_QA http=%{http_code}\n"
echo "== B end $(date)"
