import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Word } from "./types";

const SHOW_DURATION_MS = 1400;

interface EmojiOverlayProps {
  words: Word[];
}

export const EmojiOverlay: React.FC<EmojiOverlayProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const emojiWords = words.filter((w) => w.emoji);
  const active = emojiWords
    .filter((w) => currentMs >= w.startMs && currentMs <= w.startMs + SHOW_DURATION_MS)
    .at(-1);

  if (!active) return null;

  const progress = (currentMs - active.startMs) / SHOW_DURATION_MS;

  const scale = interpolate(
    progress,
    [0, 0.12, 0.8, 1],
    [0.3, 1.25, 1.05, 0.7],
    {
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = interpolate(
    progress,
    [0, 0.08, 0.65, 1],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const translateY = interpolate(progress, [0, 0.12, 1], [20, 0, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        right: "8%",
        fontSize: 110,
        lineHeight: 1,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        pointerEvents: "none",
        filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.55))",
        userSelect: "none",
      }}
    >
      {active.emoji}
    </div>
  );
};
