#!/bin/bash
cd /root/tutorial/video
B="--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --chrome-mode=chrome-for-testing"
N=28123; C=3600
for i in $(seq 0 7); do
  a=$((i*C)); b=$(( (i+1)*C-1 )); [ $b -ge $N ] && b=$((N-1))
  [ -f out/yt15/ov_$i.webm ] && continue
  echo "chunk $i $a-$b $(date +%T)"
  npx remotion render src/index.ts YT15Overlay out/yt15/ov_$i.tmp.webm --frames=$a-$b --codec=vp9 --image-format=png --pixel-format=yuva420p --concurrency=2 $B --log=error && mv out/yt15/ov_$i.tmp.webm out/yt15/ov_$i.webm
done
echo ALLDONE $(date +%T)
