#!/usr/bin/env bash
# =============================================================
# ClearPath Video Production - Final Assembly Script
# Location: marketing/video/assemble.sh
#
# Fixes:
#   - Crops bottom 40px (browser scrollbar) — no more white patch
#   - Scales to exact 1920x1080 with dark background padding
#   - Merges narration.mp3 (already synced via timings.json)
#   - Outputs clearpath_demo_final.mp4
#
# Run after: generate_audio.js → record.js
# =============================================================

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🎬 Step 1: Converting WebM → MP4 (crop scrollbar + scale to 1920x1080)..."
ffmpeg -y \
  -i "$DIR/raw_recording.webm" \
  -vf "crop=1920:1040:0:0,scale=1920:1080:flags=lanczos,pad=1920:1080:0:0:color=#0f172a" \
  -c:v libx264 \
  -preset slow \
  -crf 17 \
  -pix_fmt yuv420p \
  -r 30 \
  "$DIR/raw_recording.mp4"

echo ""
echo "🔊 Step 2: Merging narration.mp3 with video..."
ffmpeg -y \
  -i "$DIR/raw_recording.mp4" \
  -i "$DIR/narration.mp3" \
  -c:v copy \
  -c:a aac \
  -b:a 192k \
  -shortest \
  "$DIR/clearpath_demo_final.mp4"

echo ""
echo "✅ Done! Final video: $DIR/clearpath_demo_final.mp4"
SIZE=$(du -sh "$DIR/clearpath_demo_final.mp4" | cut -f1)
echo "   File size: $SIZE"
