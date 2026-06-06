import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface VideoHookFrameProps {
  videoSrc: string;
  line1: string;
  line2: string;
  line3?: string;
  bgColor?: string;
  accentColor?: string;
  durationMs?: number;
}

// Daisy/Spinner-Icon — 8 breite abgerundete Rechteck-Blätter wie im Referenz-Bild
const Sunburst: React.FC<{ color: string; size: number; rotation?: number }> = ({
  color,
  size,
  rotation = 0,
}) => {
  const blades = 8;
  const bladeW = 22;   // Breite der Blätter in %
  const bladeH = 36;   // Höhe/Länge der Blätter in %
  const gap = 14;      // Abstand vom Zentrum in %

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {Array.from({ length: blades }).map((_, i) => {
        const angle = (i / blades) * 360;
        return (
          <rect
            key={i}
            x={50 - bladeW / 2}
            y={gap}
            width={bladeW}
            height={bladeH}
            rx={bladeW / 2}
            ry={bladeW / 2}
            fill={color}
            transform={`rotate(${angle}, 50, 50)`}
          />
        );
      })}
    </svg>
  );
};

export const VideoHookFrame: React.FC<VideoHookFrameProps> = ({
  videoSrc,
  line1,
  line2,
  line3,
  bgColor = "#C4714A",
  accentColor = "#4DD9D9",
  durationMs = 30000,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Hintergrund-Block: erscheint sofort mit leichtem Scale-in
  const bgSpring = spring({ fps, frame, config: { damping: 20, stiffness: 80, mass: 0.8 } });
  const bgScale = interpolate(bgSpring, [0, 1], [0.85, 1]);
  const bgOpacity = interpolate(bgSpring, [0, 0.5, 1], [0, 1, 1]);

  // Sunburst: dreht sich langsam
  const sunRotation = interpolate(frame, [0, fps * 10], [0, 25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Vordergrund-Texte: gestaffelt reinfliegen
  const line1Spring = spring({
    fps,
    frame: frame - fps * 0.1,
    config: { damping: 14, stiffness: 90 },
  });
  const line2Spring = spring({
    fps,
    frame: frame - fps * 0.2,
    config: { damping: 12, stiffness: 70, mass: 1.2 },
  });
  const line3Spring = spring({
    fps,
    frame: frame - fps * 0.35,
    config: { damping: 14, stiffness: 80 },
  });

  const blockSize = width * 0.82;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>

      {/* ── LAYER 1: Hintergrund-Block mit Sunburst (oben zentriert) ── */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: height * 0.05,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: blockSize,
            height: blockSize * 0.9,
            borderRadius: 48,
            background: bgColor,
            transform: `scale(${bgScale})`,
            opacity: bgOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Sunburst color="rgba(255,255,255,0.9)" size={blockSize * 0.78} rotation={sunRotation} />
        </div>
      </AbsoluteFill>

      {/* ── LAYER 2: Milans Video ── */}
      {videoSrc ? (
        <AbsoluteFill style={{ zIndex: 2 }}>
          <OffthreadVideo
            src={videoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            zIndex: 2,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      )}

      {/* ── LAYER 3: Vordergrund-Text ── */}
      <AbsoluteFill
        style={{
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingBottom: height * 0.1,
          paddingLeft: 52,
          paddingRight: 40,
          fontFamily: "'Montserrat', sans-serif",
          pointerEvents: "none",
        }}
      >
        {/* "FÜR" */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: -8,
            transform: `translateY(${interpolate(line1Spring, [0, 1], [30, 0])}px)`,
            opacity: interpolate(line1Spring, [0, 0.5, 1], [0, 1, 1]),
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {line1}
        </div>

        {/* "CLAUDE" — riesig */}
        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: -4,
            lineHeight: 0.88,
            transform: `translateY(${interpolate(line2Spring, [0, 1], [50, 0])}px) scale(${interpolate(line2Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(line2Spring, [0, 0.4, 1], [0, 1, 1]),
            transformOrigin: "left bottom",
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          {line2}
        </div>

        {/* "die du kennen musst" */}
        {line3 && (
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#ffffff",
              fontStyle: "italic",
              lineHeight: 1.2,
              marginTop: 4,
              transform: `translateY(${interpolate(line3Spring, [0, 1], [20, 0])}px)`,
              opacity: interpolate(line3Spring, [0, 0.5, 1], [0, 1, 1]),
              textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            }}
          >
            {line3}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
