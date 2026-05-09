import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";
import type { BRollSegment } from "./types";

interface BRollOverlayProps {
  segments: BRollSegment[];
}

export const BRollOverlay: React.FC<BRollOverlayProps> = ({ segments }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const activeSegment = segments.find(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  );

  if (!activeSegment?.resolvedVideoUrl) return null;

  const segmentDurationMs = activeSegment.endMs - activeSegment.startMs;
  const elapsedMs = currentMs - activeSegment.startMs;
  const progress = elapsedMs / segmentDurationMs;

  const fadeIn = interpolate(progress, [0, 0.08], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(progress, [0.88, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut) * 0.85;

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <OffthreadVideo
        src={activeSegment.resolvedVideoUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};
