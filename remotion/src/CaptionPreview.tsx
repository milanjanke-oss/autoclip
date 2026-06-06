import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "./Caption";
import type { CaptionStyle, Word } from "./types";

// Dev-Werkzeug: rendert nur die Untertitel über einem dunklen Verlauf (kein Video nötig),
// damit sich alle Stile als Standbild oder im Studio schnell visuell prüfen lassen.
const SAMPLE_WORDS: Word[] = [
  { text: "Diese", startMs: 0, endMs: 400, timestampMs: 200, confidence: 1 },
  { text: "Untertitel", startMs: 400, endMs: 1000, timestampMs: 700, confidence: 1 },
  { text: "sind", startMs: 1000, endMs: 1300, timestampMs: 1150, confidence: 1 },
  { text: "richtig", startMs: 1300, endMs: 1800, timestampMs: 1550, confidence: 1 },
  { text: "stark", startMs: 1800, endMs: 2400, timestampMs: 2100, confidence: 1 },
];

export const CaptionPreview: React.FC<{ captionStyle: CaptionStyle }> = ({ captionStyle }) => {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #1a1f2b 0%, #0b0d12 100%)" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <Caption words={SAMPLE_WORDS} style={captionStyle} />
    </AbsoluteFill>
  );
};
