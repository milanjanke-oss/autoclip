import { loadFont } from "@remotion/google-fonts/Montserrat";
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionStyle, Word } from "./types";

const { fontFamily: sans } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

interface Chunk {
  words: Word[];
  startMs: number;
  endMs: number;
}

function chunkWords(words: Word[], n: number): Chunk[] {
  const chunks: Chunk[] = [];
  for (let i = 0; i < words.length; i += n) {
    const group = words.slice(i, i + n);
    chunks.push({
      words: group,
      startMs: group[0].startMs,
      endMs: group[group.length - 1].endMs,
    });
  }
  return chunks;
}

const POSITION_BOTTOM: Record<CaptionStyle["position"], string> = {
  bottom: "10%",
  middle: "45%",
  top: "80%",
};

interface CaptionProps {
  words: Word[];
  style: CaptionStyle;
}

export const Caption: React.FC<CaptionProps> = ({ words, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const chunks = chunkWords(words, style.wordsPerChunk);
  const activeChunk =
    chunks.find((c) => currentMs >= c.startMs && currentMs <= c.endMs + 200) ?? null;

  if (!activeChunk) return null;

  const bottomValue = POSITION_BOTTOM[style.position];

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomValue,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 16,
        rowGap: 4,
        padding: "0 56px",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {activeChunk.words.map((word, i) => {
        const isActive = currentMs >= word.startMs && currentMs <= word.endMs;
        const wasSpoken = currentMs > word.endMs;

        const scale = isActive
          ? interpolate(
              currentMs,
              [word.startMs, word.startMs + 100],
              [0.88, 1],
              {
                easing: Easing.bezier(0.34, 1.56, 0.64, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            )
          : 1;

        return (
          <span
            key={i}
            style={{
              fontFamily: sans,
              fontSize: style.fontSize,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              textTransform: "uppercase",
              display: "inline-block",
              color: isActive ? style.highlightColor : style.color,
              opacity: wasSpoken ? 0.55 : 1,
              transform: `scale(${scale})`,
              transformOrigin: "center bottom",
              textShadow:
                "0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)",
            }}
          >
            {word.text.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
