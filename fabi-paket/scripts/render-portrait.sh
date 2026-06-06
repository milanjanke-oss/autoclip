#!/bin/bash
# Vollautomatischer Portrait-Workflow (kein Green Screen, kein CapCut)
# 1. Video downscalen
# 2. Hintergrund entfernen (rembg AI, Apple Silicon MPS)
# 3. Remotion rendert: BG + Claude-Logo + Du + Text
#
# Aufruf:
#   ./scripts/render-portrait.sh ~/Desktop/video.mp4 "FÜR" "CLAUDE" "die du kennen musst"
#   ./scripts/render-portrait.sh ~/Desktop/video.mp4 "DIE" "AUTOMATISIERUNG" "die alles verändert" "#1a1a1a" "#FFE600"
#   ./scripts/render-portrait.sh ~/Desktop/video.mp4 "DIE" "WOLKE" "hinter dir" "#1a1a1a" "#FFE600" "cloud"
#
# backgroundIcon (Argument 7): claude | cloud | bolt | star | spark | none  (Standard: claude)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

VIDEO_PATH="${1}"
LINE1="${2:-FÜR}"
LINE2="${3:-CLAUDE}"
LINE3="${4:-die du kennen musst}"
BG_COLOR="${5:-#C4714A}"
ACCENT_COLOR="${6:-#4DD9D9}"
BACKGROUND_ICON="${7:-claude}"

FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")

if [ -z "$VIDEO_PATH" ]; then
  echo "Aufruf: ./scripts/render-portrait.sh <video.mp4> <line1> <line2> [line3] [bgColor] [accentColor]"
  exit 1
fi

VIDEO_PATH="$(realpath "$VIDEO_PATH")"
BASENAME=$(basename "${VIDEO_PATH%.*}")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p public/hook exports/hook

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Portrait-Workflow startet"
echo " Video: $VIDEO_PATH"
echo " Text: $LINE1 / $LINE2 / $LINE3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# SCHRITT 1: Downscale auf 1080p
echo ""
echo "[1/3] Downscale auf 1080p..."
$FFMPEG -i "$VIDEO_PATH" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 18 -preset fast \
  "public/hook/${BASENAME}_1080p.mp4" -y 2>/dev/null
echo "      ✓ public/hook/${BASENAME}_1080p.mp4"

# SCHRITT 2: Background Removal
echo ""
echo "[2/3] Hintergrund entfernen (AI, MPS)..."
python3 scripts/remove_bg.py \
  "public/hook/${BASENAME}_1080p.mp4" \
  "public/hook/${BASENAME}_alpha.webm" 2>&1 | grep -E "%|Fertig|Frames|Error"

# ProRes → VP8 WebM (Remotion Alpha-kompatibel)
$FFMPEG -i "public/hook/${BASENAME}_alpha.mov" \
  -c:v libvpx -pix_fmt yuva420p -auto-alt-ref 0 -b:v 8M -quality good -cpu-used 2 \
  "public/hook/${BASENAME}_vp8.webm" -y 2>/dev/null
echo "      ✓ public/hook/${BASENAME}_vp8.webm"

# SCHRITT 3: Remotion Render
echo ""
echo "[3/3] Remotion rendert finales Video..."

DURATION_MS=$(python3 -c "
import imageio
r = imageio.get_reader('public/hook/${BASENAME}_1080p.mp4')
m = r.get_meta_data()
fps = m.get('fps', 30)
nf = m.get('nframes', 380)
print(int(nf / fps * 1000))
r.close()
" 2>/dev/null || echo "12670")
TOTAL_FRAMES=$(python3 -c "print(int(${DURATION_MS}/1000*30))" 2>/dev/null || echo "380")

OUTPUT="exports/hook/${BASENAME}_portrait_${TIMESTAMP}.mp4"
PROPS="{\"personVideoSrc\":\"./public/hook/${BASENAME}_vp8.webm\",\"line1\":\"${LINE1}\",\"line2\":\"${LINE2}\",\"line3\":\"${LINE3}\",\"bgColor\":\"${BG_COLOR}\",\"accentColor\":\"${ACCENT_COLOR}\",\"logoColor\":\"#ffffff\",\"durationMs\":${DURATION_MS},\"backgroundIcon\":\"${BACKGROUND_ICON}\"}"

npx remotion render VideoPortraitFrame "$OUTPUT" \
  --props="$PROPS" \
  --codec=h264 --crf=18 \
  --frames="0-${TOTAL_FRAMES}" 2>&1 | grep -E "^\+|Error" | tail -3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " FERTIG: $OUTPUT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
open "$OUTPUT" 2>/dev/null || true
