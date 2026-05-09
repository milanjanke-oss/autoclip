import { loadFont } from "@remotion/google-fonts/Montserrat";
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionStyle, CaptionVariant, Word } from "./types";

const { fontFamily: sans } = loadFont("normal", {
  weights: ["600", "700", "800", "900"],
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
    chunks.push({ words: group, startMs: group[0].startMs, endMs: group[group.length - 1].endMs });
  }
  return chunks;
}

const POSITION_BOTTOM: Record<CaptionStyle["position"], string> = {
  bottom: "10%",
  middle: "45%",
  top: "80%",
};

function isLightHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.58;
}

function getWordStyle(
  variant: CaptionVariant,
  isActive: boolean,
  wasSpoken: boolean,
  scale: number,
  style: CaptionStyle
): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: sans,
    display: "inline-block",
    transformOrigin: "center bottom",
  };

  switch (variant) {
    case "box":
      return {
        ...base,
        fontSize: style.fontSize,
        fontWeight: 800,
        letterSpacing: "-1px",
        lineHeight: 1.15,
        borderRadius: 12,
        padding: "2px 14px",
        background: isActive ? style.highlightColor : "rgba(0,0,0,0.45)",
        color: isActive ? (isLightHex(style.highlightColor) ? "#111" : "#fff") : style.color,
        opacity: wasSpoken ? 0.5 : 1,
        transform: `scale(${isActive ? 1.04 : 1})`,
        transition: "background 0.1s, transform 0.1s",
      };

    case "outline":
      return {
        ...base,
        fontSize: style.fontSize,
        fontWeight: 900,
        letterSpacing: "-1.5px",
        lineHeight: 1.1,
        textTransform: "uppercase",
        color: isActive ? style.highlightColor : style.color,
        WebkitTextStroke: isActive ? `3px rgba(0,0,0,0.95)` : `2px rgba(0,0,0,0.8)`,
        opacity: wasSpoken ? 0.55 : 1,
        transform: `scale(${scale})`,
        filter: isActive ? "drop-shadow(0 2px 6px rgba(0,0,0,0.7))" : "none",
      };

    case "minimal":
      return {
        ...base,
        fontSize: Math.round(style.fontSize * 0.72),
        fontWeight: 600,
        letterSpacing: "0px",
        lineHeight: 1.3,
        color: isActive ? "#ffffff" : style.color,
        opacity: isActive ? 1 : wasSpoken ? 0.35 : 0.65,
        textShadow: "0 1px 6px rgba(0,0,0,0.8)",
        transform: `scale(${isActive ? 1.02 : 1})`,
      };

    case "neon":
      return {
        ...base,
        fontSize: style.fontSize,
        fontWeight: 800,
        letterSpacing: "-1.5px",
        lineHeight: 1.1,
        textTransform: "uppercase",
        color: isActive ? style.highlightColor : style.color,
        opacity: wasSpoken ? 0.4 : 1,
        transform: `scale(${scale})`,
        filter: isActive
          ? `drop-shadow(0 0 12px ${style.highlightColor}) drop-shadow(0 0 28px ${style.highlightColor}88)`
          : `drop-shadow(0 2px 8px rgba(0,0,0,0.9))`,
      };

    default: // classic
      return {
        ...base,
        fontSize: style.fontSize,
        fontWeight: 800,
        letterSpacing: "-1.5px",
        lineHeight: 1.1,
        textTransform: "uppercase",
        color: isActive ? style.highlightColor : style.color,
        opacity: wasSpoken ? 0.55 : 1,
        transform: `scale(${scale})`,
        textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)",
      };
  }
}

interface CaptionProps {
  words: Word[];
  style: CaptionStyle;
}

export const Caption: React.FC<CaptionProps> = ({ words, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const variant: CaptionVariant = style.variant ?? "classic";

  const chunks = chunkWords(words, style.wordsPerChunk);
  const activeChunk = chunks.find((c) => currentMs >= c.startMs && currentMs <= c.endMs + 200) ?? null;

  if (!activeChunk) return null;

  const bottomValue = POSITION_BOTTOM[style.position];
  const isBox = variant === "box";

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
        columnGap: isBox ? 8 : 16,
        rowGap: isBox ? 6 : 4,
        padding: "0 48px",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {activeChunk.words.map((word, i) => {
        const isActive = currentMs >= word.startMs && currentMs <= word.endMs;
        const wasSpoken = currentMs > word.endMs;

        const scale =
          isActive
            ? interpolate(currentMs, [word.startMs, word.startMs + 100], [0.88, 1], {
                easing: Easing.bezier(0.34, 1.56, 0.64, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

        return (
          <span key={i} style={getWordStyle(variant, isActive, wasSpoken, scale, style)}>
            {isBox ? word.text : word.text.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
