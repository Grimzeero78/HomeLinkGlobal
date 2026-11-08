#!/bin/bash
# HuntIn GLOBAL promo rebuild — same song ('Wallpaper' Kevin MacLeod CC-BY),
# same 37.3s structure as the delivered video. Hard cuts (no xfade — 2-core box),
# zoompan on single-frame inputs, detached-run friendly (markers at the end).
set -e
P=/home/z/my-project/promo_global
A=$P/assets; S=$P/seg; O=$P/out
mkdir -p $S $O
ENC="-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30"

seg () { # srcpng frames out zoom
  [ -s "$3" ] && { echo "skip $3"; return; }
  ffmpeg -y -v error -i "$1" -filter_complex \
  "[0:v]scale=1620:2880:flags=lanczos,zoompan=z='1+$4*on/$2':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=$2:s=1080x1920:fps=30,setsar=1" \
  -t $(python3 -c "print($2/30)") $ENC "$3"
}

# S1 5.0s brand reveal
seg $A/full_s1.png 150 $S/s1.mp4 0.05
# S2 6.0s dynamic-name montage: 6 splashes x 1.0s (30f)
i=0
for cc in KE UG US IN GB AE; do
  i=$((i+1))
  seg $A/splash_$cc.png 30 $S/s2_$i.mp4 0.045
done
# S3-S7 4.5s each
seg $A/full_s3.png 135 $S/s3.mp4 0.05
seg $A/full_s4.png 135 $S/s4.mp4 0.05
seg $A/full_s5.png 135 $S/s5.mp4 0.05
seg $A/full_s6.png 135 $S/s6.mp4 0.05
seg $A/full_s7.png 135 $S/s7.mp4 0.05
# S8 3.8s end card
seg $A/full_s8.png 114 $S/s8.mp4 0.04

# concat all (same codec/params -> stream copy, no re-encode)
cat > $S/list.txt << EOF
file '$S/s1.mp4'
file '$S/s2_1.mp4'
file '$S/s2_2.mp4'
file '$S/s2_3.mp4'
file '$S/s2_4.mp4'
file '$S/s2_5.mp4'
file '$S/s2_6.mp4'
file '$S/s3.mp4'
file '$S/s4.mp4'
file '$S/s5.mp4'
file '$S/s6.mp4'
file '$S/s7.mp4'
file '$S/s8.mp4'
EOF
ffmpeg -y -v error -f concat -safe 0 -i $S/list.txt -c copy $S/video.mp4
# mux the SAME song cut as the KE/global original: 37.3s, fade in/out
ffmpeg -y -v error -i $S/video.mp4 -i /home/z/my-project/promo2/music/wallpaper.mp3 -filter_complex \
"[1:a]atrim=0:37.3,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.0,afade=t=out:st=34.3:d=3.0,volume=0.95[aout]" \
-map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -movflags +faststart -t 37.3 $O/HuntInGlobal-promo.mp4
# 720p WhatsApp version
ffmpeg -y -v error -i $O/HuntInGlobal-promo.mp4 -vf scale=720:1280 -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -c:a copy -movflags +faststart $O/HuntInGlobal-promo-720p.mp4
cp $O/HuntInGlobal-promo.mp4 $O/HuntInGlobal-promo-720p.mp4 /home/z/my-project/download/
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $O/HuntInGlobal-promo.mp4
echo BUILD_DONE
