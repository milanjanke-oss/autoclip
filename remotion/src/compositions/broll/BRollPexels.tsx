import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BRollPexelsProps {
  videoUrl: string;
  overlayText?: string;
  overlayPosition?: "top" | "bottom";
  durationMs?: number;
}

export const BRollPexels: React.FC<BRollPexelsProps> = ({
  videoUrl,
  overlayText,
  overlayPosition = "bottom",
  durationMs = 5000,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round((durationMs / 1000) * fps);

  const fadeIn = interpolate(frame, [0, fps * 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [totalFrames - fps * 0.25, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const videoOpacity = Math.min(fadeIn, fadeOut);

  const textSpring = spring({
    fps,
    frame: frame - fps * 0.3,
    config: { damping: 14, stiffness: 80, mass: 0.6 },
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(textSpring, [0, 0.4, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: videoOpacity }}>
        <OffthreadVideo
          src={videoUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Gradient-Overlay für Lesbarkeit */}
      <AbsoluteFill
        style={{
          background:
            overlayPosition === "bottom"
              ? "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)"
              : "linear-gradient(to top, transparent 50%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
        }}
      />

      {overlayText && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: overlayPosition === "bottom" ? "flex-end" : "flex-start",
            padding: overlayPosition === "bottom" ? "0 60px 120px" : "120px 60px 0",
          }}
        >
          <div
            style={{
              transform: `translateY(${textY}px)`,
              opacity: textOpacity,
              fontSize: 64,
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "'Montserrat', sans-serif",
              textTransform: "uppercase",
              lineHeight: 1.15,
              letterSpacing: -1,
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            {overlayText}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
