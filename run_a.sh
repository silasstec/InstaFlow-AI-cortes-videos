#!/bin/bash
# Stage A: assets -> shots -> video_clean.mp4 -> PUT (url in up_a.txt)
cd /home/user/build
mkdir -p src fonts out2
echo "== A start $(date)"; nproc; ffmpeg -version | head -1
cp cfg3.json cfg2.json
STAGE=A python3 build3.py
rc=$?; echo "== build rc=$rc $(date)"
ls -la out2/video_clean.mp4 && curl -sS -f -X PUT -H "Content-Type: video/mp4" --data-binary @out2/video_clean.mp4 "$(cat up_a.txt)" -o /dev/null -w "PUT_A http=%{http_code}\n"
echo "== A end $(date)"
