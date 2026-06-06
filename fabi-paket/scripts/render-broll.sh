#!/bin/bash
# B-Roll Batch-Render-Script
# Aufruf: ./scripts/render-broll.sh [komposition] [props-json]
# Beispiele:
#   ./scripts/render-broll.sh BRollTextStats '{"title":"KI spart Zeit","bullets":["Schneller","Günstiger"],"variant":"dark"}'
#   ./scripts/render-broll.sh BRollMotion '{"variant":"counter","value":80,"label":"Zeitersparnis","suffix":"%"}'
#   ./scripts/render-broll.sh BRollPexels '{"videoUrl":"./public/broll/office.mp4","overlayText":"So läufts 2025"}'
#   ./scripts/render-broll.sh BRollScreen '{"screenSrc":"./public/broll/demo.mp4","label":"Live Demo"}'

set -e

COMPOSITION="${1:-BRollTextStats}"
PROPS="${2:-{}}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="./exports/broll/${COMPOSITION}_${TIMESTAMP}.mp4"

echo "Rendere: $COMPOSITION"
echo "Output:  $OUTPUT"
echo "Props:   $PROPS"
echo ""

npx remotion render "$COMPOSITION" "$OUTPUT" \
  --props="$PROPS" \
  --codec=h264 \
  --crf=18 \
  --log=verbose

echo ""
echo "Fertig: $OUTPUT"
open "$OUTPUT" 2>/dev/null || true
