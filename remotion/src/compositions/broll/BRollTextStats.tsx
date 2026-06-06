import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface StatConfig {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface BRollTextStatsProps {
  title: string;
  bullets?: string[];
  stat?: StatConfig;
  variant?: "dark" | "light" | "brand";
  durationMs?: number;
}

const THEMES = {
  dark: { bg: "#0a0a0a", text: "#ffffff", accent: "#FFE600", sub: "#cccccc" },
  light: { bg: "#f5f5f5", text: "#0a0a0a", accent: "#FFE600", sub: "#555555" },
  brand: { bg: "#FFE600", text: "#0a0a0a", accent: "#0a0a0a", sub: "#333333" },
};

export const BRollTextStats: React.FC<BRollTextStatsProps> = ({
  title,
  bullets = [],
  stat,
  variant = "dark",
  durationMs = 4000,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = THEMES[variant];
  const totalFrames = Math.round((durationMs / 1000) * fps);

  const titleSpring = spring({ fps, frame, config: { damping: 14, stiffness: 100, mass: 0.5 } });
  const titleX = interpolate(titleSpring, [0, 1], [-60, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 0.3, 1], [0, 1, 1]);

  const statValue = stat
    ? Math.floor(
        interpolate(frame, [fps * 0.4, totalFrames * 0.75], [0, stat.value], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        })
      )
    : 0;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        fontFamily: "'Montserrat', sans-serif",
        padding: "80px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Accent bar links */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "15%",
          height: "70%",
          width: 8,
          background: theme.accent,
          borderRadius: "0 4px 4px 0",
        }}
      />

      {/* Titel */}
      <div
        style={{
          transform: `translateX(${titleX}px)`,
          opacity: titleOpacity,
          fontSize: 72,
          fontWeight: 900,
          color: theme.text,
          lineHeight: 1.1,
          marginBottom: 48,
          textTransform: "uppercase",
          letterSpacing: -1,
        }}
      >
        {title}
      </div>

      {/* Bullets */}
      {bullets.map((bullet, i) => {
        const delay = fps * 0.3 + i * fps * 0.18;
        const bulletSpring = spring({
          fps,
          frame: frame - delay,
          config: { damping: 16, stiffness: 90, mass: 0.6 },
        });
        const bX = interpolate(bulletSpring, [0, 1], [-50, 0]);
        const bOp = interpolate(bulletSpring, [0, 0.4, 1], [0, 1, 1]);

        return (
          <div
            key={i}
            style={{
              transform: `translateX(${bX}px)`,
              opacity: bOp,
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: theme.accent,
                flexShrink: 0,
                marginTop: 10,
              }}
            />
            <span style={{ fontSize: 52, fontWeight: 700, color: theme.sub, lineHeight: 1.3 }}>
              {bullet}
            </span>
          </div>
        );
      })}

      {/* Statistik count-up */}
      {stat && (
        <div
          style={{
            marginTop: bullets.length > 0 ? 48 : 0,
            opacity: interpolate(frame, [fps * 0.35, fps * 0.65], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: theme.accent,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            {stat.prefix ?? ""}
            {statValue.toLocaleString("de-DE")}
            {stat.suffix ?? ""}
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, color: theme.sub, marginTop: 12 }}>
            {stat.label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
