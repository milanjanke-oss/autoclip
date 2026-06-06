#!/bin/bash
# Video-Hook-Frame Render-Script
# Aufruf: ./scripts/render-hook.sh <video-datei> <line1> <line2> [line3] [bgColor] [accentColor]
#
# Beispiel:
#   ./scripts/render-hook.sh ~/Desktop/mein_video.mp4 "FÜR" "KI TOOLS" "die du kennen musst"
#   ./scripts/render-hook.sh ~/Desktop/tag1.mp4 "DIE" "AUTOMATISIERUNG" "die alles verändert" "#1a1a2e" "#FFE600"

set -e

VIDEO_PATH="${1}"
LINE1="${2:-FÜR}"
LINE2="${3:-CLAUDE}"
LINE3="${4:-die du kennen musst}"
BG_COLOR="${5:-#C4714A}"
ACCENT_COLOR="${6:-#4DD9D9}"

# ffprobe via imageio_ffmpeg (plattformunabhängig, kein globales ffprobe nötig)
FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
FFPROBE="$(dirname "$FFMPEG")/ffprobe"

if [ -z "$VIDEO_PATH" ]; then
  echo "Fehler: Kein Video angegeben."
  echo "Aufruf: ./scripts/render-hook.sh <video.mp4> <line1> <line2> [line3] [bgColor] [accentColor]"
  exit 1
fi

# Video in public/hook/ kopieren
mkdir -p ./public/hook
VIDEO_FILENAME=$(basename "$VIDEO_PATH")
cp "$VIDEO_PATH" "./public/hook/$VIDEO_FILENAME"
echo "Video kopiert: ./public/hook/$VIDEO_FILENAME"

# Dauer des Videos ermitteln (Sekunden)
DURATION_SEC=$("$FFPROBE" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "./public/hook/$VIDEO_FILENAME" 2>/dev/null || echo "30")
DURATION_MS=$(echo "$DURATION_SEC * 1000" | bc | cut -d. -f1)
TOTAL_FRAMES=$(echo "$DURATION_SEC * 30" | bc | cut -d. -f1)

echo "Video-Dauer: ${DURATION_SEC}s → ${TOTAL_FRAMES} Frames"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="./exports/hook/${LINE2// /_}_${TIMESTAMP}.mp4"
mkdir -p ./exports/hook

echo ""
echo "Rendere VideoHookFrame..."
echo "  Line1: $LINE1"
echo "  Line2: $LINE2"
echo "  Line3: $LINE3"
echo "  Background: $BG_COLOR | Accent: $ACCENT_COLOR"
echo "  Output: $OUTPUT"
echo ""

PROPS="{\"videoSrc\":\"./public/hook/$VIDEO_FILENAME\",\"line1\":\"$LINE1\",\"line2\":\"$LINE2\",\"line3\":\"$LINE3\",\"bgColor\":\"$BG_COLOR\",\"accentColor\":\"$ACCENT_COLOR\",\"durationMs\":$DURATION_MS}"

npx remotion render VideoHookFrame "$OUTPUT" \
  --props="$PROPS" \
  --codec=h264 \
  --crf=18

echo ""
echo "Fertig: $OUTPUT"
open "$OUTPUT" 2>/dev/null || true
