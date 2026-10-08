#!/bin/bash
cd /home/user/build; mkdir -p src fonts out2
echo "== B start $(date)"
cp cfg7.json cfg2.json
[ -s out2/video_clean.mp4 ] || curl -sL --retry 3 -o out2/video_clean.mp4 "$(cat clean_url.txt)"; ls -la out2/video_clean.mp4
SKIP_SHOTS=1 python3 build6.py
rc=$?; echo "== build rc=$rc $(date)"
ls -la out2/final.mp4 out2/qa_sheet.jpg
curl -sS -f -X PUT -H "Content-Type: video/mp4" --data-binary @out2/final.mp4 "$(cat up_final.txt)" -o /dev/null -w "PUT_FINAL http=%{http_code}\n"
curl -sS -f -X PUT -H "Content-Type: image/jpeg" --data-binary @out2/qa_sheet.jpg "$(cat up_qa.txt)" -o /dev/null -w "PUT_QA http=%{http_code}\n"
echo "== B end $(date)"
