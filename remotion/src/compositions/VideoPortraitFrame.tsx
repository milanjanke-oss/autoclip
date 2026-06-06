import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type BackgroundIcon = "claude" | "cloud" | "bolt" | "star" | "spark" | "none";

interface VideoPortraitFrameProps {
  personVideoSrc: string;
  line1?: string;
  line2: string;
  line3?: string;
  bgColor?: string;
  accentColor?: string;
  logoColor?: string;
  durationMs?: number;
  backgroundIcon?: BackgroundIcon;
}

interface IconProps {
  size: number;
  color: string;
  opacity: number;
  scale: number;
}

// Claude-Logo SVG (Anthropic-Stil: Starburst mit C-Form innen)
const ClaudeLogo: React.FC<IconProps> = ({
  size,
  color,
  opacity,
  scale,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center center" }}
  >
    {/* Äußerer Strahlenkranz */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x1 = 100 + Math.cos(angle) * 58;
      const y1 = 100 + Math.sin(angle) * 58;
      const x2 = 100 + Math.cos(angle) * 90;
      const y2 = 100 + Math.sin(angle) * 90;
      return (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth={i % 3 === 0 ? 8 : 5}
          strokeLinecap="round"
          opacity={i % 3 === 0 ? 1 : 0.6}
        />
      );
    })}
    {/* Innerer Kreis */}
    <circle cx="100" cy="100" r="42" fill="none" stroke={color} strokeWidth="10" />
    {/* Großes "C" innen */}
    <path
      d="M 122 72 A 35 35 0 1 0 122 128"
      fill="none"
      stroke={color}
      strokeWidth="11"
      strokeLinecap="round"
    />
    {/* Zwei kleine Punkte am C */}
    <circle cx="122" cy="72" r="5.5" fill={color} />
    <circle cx="122" cy="128" r="5.5" fill={color} />
  </svg>
);

const CloudIcon: React.FC<IconProps> = ({ size, color, opacity, scale }) => (
  <svg width={size} height={size} viewBox="0 0 200 200"
    style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center center" }}>
    <path
      d="M 62 148 Q 28 148 26 116 Q 24 90 50 84 Q 48 80 48 74 Q 48 48 70 40 Q 88 34 104 50 Q 112 32 134 30 Q 164 28 170 60 Q 192 56 194 80 Q 198 108 176 122 Q 194 132 192 150 Q 188 168 166 165 H 62 Z"
      fill="none"
      stroke={color}
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BoltIcon: React.FC<IconProps> = ({ size, color, opacity, scale }) => (
  <svg width={size} height={size} viewBox="0 0 200 200"
    style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center center" }}>
    <path
      d="M 118 22 L 68 112 L 103 112 L 82 178 L 138 88 L 103 88 Z"
      fill="none"
      stroke={color}
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon: React.FC<IconProps> = ({ size, color, opacity, scale }) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? 82 : 36;
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center center" }}>
      <polygon points={points} fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );
};

const SparkIcon: React.FC<IconProps> = ({ size, color, opacity, scale }) => (
  <svg width={size} height={size} viewBox="0 0 200 200"
    style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center center" }}>
    <path
      d="M 100 16 L 112 88 L 184 100 L 112 112 L 100 184 L 88 112 L 16 100 L 88 88 Z"
      fill="none"
      stroke={color}
      strokeWidth="9"
      strokeLinejoin="round"
    />
    <path
      d="M 157 38 L 161 56 L 179 60 L 161 64 L 157 82 L 153 64 L 135 60 L 153 56 Z"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M 43 118 L 47 136 L 65 140 L 47 144 L 43 162 L 39 144 L 21 140 L 39 136 Z"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

const getBackgroundIcon = (
  icon: BackgroundIcon,
  size: number,
  color: string,
  opacity: number,
  scale: number
): React.ReactNode => {
  switch (icon) {
    case "cloud": return <CloudIcon size={size} color={color} opacity={opacity} scale={scale} />;
    case "bolt": return <BoltIcon size={size} color={color} opacity={opacity} scale={scale} />;
    case "star": return <StarIcon size={size} color={color} opacity={opacity} scale={scale} />;
    case "spark": return <SparkIcon size={size} color={color} opacity={opacity} scale={scale} />;
    case "none": return null;
    default: return <ClaudeLogo size={size} color={color} opacity={opacity} scale={scale} />;
  }
};

export const VideoPortraitFrame: React.FC<VideoPortraitFrameProps> = ({
  personVideoSrc,
  line1 = "FÜR",
  line2,
  line3,
  bgColor = "#C4714A",
  accentColor = "#4DD9D9",
  logoColor = "#ffffff",
  durationMs = 12000,
  backgroundIcon = "claude",
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // Logo: erscheint mit Pulse-Animation
  const logoSpring = spring({ fps, frame: frame - fps * 0.1, config: { damping: 12, stiffness: 60, mass: 1.2 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 0.4, 1], [0, 1, 1]);

  // Logo rotiert langsam
  const logoRotation = interpolate(frame, [0, fps * 20], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo pulsiert subtil
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.8),
    [-1, 1],
    [0.95, 1.05]
  );

  // Text-Animationen
  const line1Spring = spring({ fps, frame: frame - fps * 0.15, config: { damping: 14, stiffness: 90 } });
  const line2Spring = spring({ fps, frame: frame - fps * 0.25, config: { damping: 12, stiffness: 70, mass: 1.2 } });
  const line3Spring = spring({ fps, frame: frame - fps * 0.38, config: { damping: 14, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ background: bgColor, overflow: "hidden" }}>

      {/* ── LAYER 1: Hintergrund-Gradient ── */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${bgColor} 0%, rgba(0,0,0,0.55) 100%)`,
          zIndex: 1,
        }}
      />

      {/* ── LAYER 2: Hintergrund-Icon (hinter Person, per backgroundIcon wählbar) ── */}
      {backgroundIcon !== "none" && (
        <AbsoluteFill
          style={{
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: height * 0.18,
          }}
        >
          <div
            style={{
              transform: `rotate(${logoRotation}deg) scale(${pulse})`,
              transformOrigin: "center center",
            }}
          >
            {getBackgroundIcon(backgroundIcon, 680, logoColor, logoOpacity * 0.55, logoScale)}
          </div>
        </AbsoluteFill>
      )}

      {/* ── LAYER 3: Transparentes Person-Video (kein Hintergrund) ── */}
      <AbsoluteFill style={{ zIndex: 3 }}>
        <OffthreadVideo
          src={personVideoSrc}
          transparent
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* ── LAYER 4: Gradient unten (Text-Lesbarkeit) ── */}
      <AbsoluteFill
        style={{
          zIndex: 4,
          background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.72) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── LAYER 5: Text vorne ── */}
      <AbsoluteFill
        style={{
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingBottom: height * 0.09,
          paddingLeft: 52,
          paddingRight: 40,
          fontFamily: "'Montserrat', sans-serif",
          pointerEvents: "none",
        }}
      >
        {line1 && (
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
              textShadow: "0 2px 16px rgba(0,0,0,0.7)",
            }}
          >
            {line1}
          </div>
        )}

        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: -4,
            lineHeight: 0.88,
            transform: `translateY(${interpolate(line2Spring, [0, 1], [50, 0])}px) scale(${interpolate(line2Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(line2Spring, [0, 0.4, 1], [0, 1, 1]),
            transformOrigin: "left bottom",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
          }}
        >
          {line2}
        </div>

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
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            {line3}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
