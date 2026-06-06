import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BeforeAfterProps {
  before: string;
  after: string;
}

interface ArrowFlowProps {
  steps: string[];
}

interface CounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
}

interface ProgressProps {
  label: string;
  percentage: number;
  color?: string;
  subLabel?: string;
}

type BRollMotionProps =
  | ({ variant: "before-after" } & BeforeAfterProps)
  | ({ variant: "arrow-flow" } & ArrowFlowProps)
  | ({ variant: "counter" } & CounterProps)
  | ({ variant: "progress" } & ProgressProps);

// ── Before / After ────────────────────────────────────────────────────────────
const BeforeAfter: React.FC<BeforeAfterProps & { frame: number; fps: number }> = ({
  before,
  after,
  frame,
  fps,
}) => {
  const beforeSpring = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });
  const afterSpring = spring({
    fps,
    frame: frame - fps * 0.5,
    config: { damping: 14, stiffness: 80 },
  });

  const col = (s: typeof beforeSpring, fromLeft: boolean) => ({
    transform: `translateX(${interpolate(s, [0, 1], [fromLeft ? -80 : 80, 0])}px)`,
    opacity: interpolate(s, [0, 0.4, 1], [0, 1, 1]),
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: "80px 60px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Before */}
      <div style={{ width: "100%", ...col(beforeSpring, true) }}>
        <div style={{ fontSize: 30, color: "#888", fontWeight: 700, marginBottom: 14, letterSpacing: 3, textTransform: "uppercase" }}>
          Vorher ❌
        </div>
        <div
          style={{
            background: "#1a1a1a",
            border: "2px solid #333",
            borderRadius: 20,
            padding: "36px 40px",
            fontSize: 52,
            fontWeight: 700,
            color: "#ccc",
            lineHeight: 1.3,
          }}
        >
          {before}
        </div>
      </div>

      {/* Pfeil */}
      <div
        style={{
          fontSize: 72,
          opacity: interpolate(frame, [fps * 0.4, fps * 0.7], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ↓
      </div>

      {/* After */}
      <div style={{ width: "100%", ...col(afterSpring, false) }}>
        <div style={{ fontSize: 30, color: "#FFE600", fontWeight: 700, marginBottom: 14, letterSpacing: 3, textTransform: "uppercase" }}>
          Nachher ✅
        </div>
        <div
          style={{
            background: "#1a1500",
            border: "2px solid #FFE600",
            borderRadius: 20,
            padding: "36px 40px",
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.3,
          }}
        >
          {after}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Arrow Flow ────────────────────────────────────────────────────────────────
const ArrowFlow: React.FC<ArrowFlowProps & { frame: number; fps: number }> = ({
  steps,
  frame,
  fps,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "80px 70px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {steps.map((step, i) => {
        const delay = i * fps * 0.22;
        const s = spring({ fps, frame: frame - delay, config: { damping: 15, stiffness: 90 } });
        const opacity = interpolate(s, [0, 0.4, 1], [0, 1, 1]);
        const y = interpolate(s, [0, 1], [30, 0]);

        return (
          <React.Fragment key={i}>
            <div
              style={{
                transform: `translateY(${y}px)`,
                opacity,
                display: "flex",
                alignItems: "center",
                gap: 24,
                width: "100%",
                background: "#161616",
                border: "2px solid #2a2a2a",
                borderRadius: 16,
                padding: "28px 36px",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#FFE600",
                  color: "#0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  fontSize: 36,
                  color: "#FFE600",
                  lineHeight: 1,
                  padding: "4px 0",
                  opacity,
                }}
              >
                ↓
              </div>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Counter ───────────────────────────────────────────────────────────────────
const Counter: React.FC<CounterProps & { frame: number; fps: number; totalFrames: number }> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  color = "#FFE600",
  frame,
  fps,
  totalFrames,
}) => {
  const displayValue = Math.floor(
    interpolate(frame, [fps * 0.2, totalFrames * 0.75], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    })
  );

  const mountSpring = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });
  const scale = interpolate(mountSpring, [0, 1], [0.7, 1]);
  const opacity = interpolate(mountSpring, [0, 0.4, 1], [0, 1, 1]);

  const labelSpring = spring({
    fps,
    frame: frame - fps * 0.3,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div style={{ transform: `scale(${scale})`, opacity }}>
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color,
            lineHeight: 1,
            letterSpacing: -6,
            textAlign: "center",
          }}
        >
          {prefix}
          {displayValue.toLocaleString("de-DE")}
          {suffix}
        </div>
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#ccc",
          textAlign: "center",
          marginTop: 24,
          opacity: interpolate(labelSpring, [0, 0.4, 1], [0, 1, 1]),
          transform: `translateY(${interpolate(labelSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

// ── Progress ──────────────────────────────────────────────────────────────────
const Progress: React.FC<ProgressProps & { frame: number; fps: number; totalFrames: number }> = ({
  label,
  percentage,
  color = "#FFE600",
  subLabel,
  frame,
  fps,
  totalFrames,
}) => {
  const barWidth = interpolate(frame, [fps * 0.3, totalFrames * 0.7], [0, percentage], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const mountSpring = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });
  const opacity = interpolate(mountSpring, [0, 0.4, 1], [0, 1, 1]);

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 70px",
        fontFamily: "'Montserrat', sans-serif",
        opacity,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 900, color: "#fff", marginBottom: 24, textTransform: "uppercase" }}>
        {label}
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", height: 28, background: "#2a2a2a", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: color,
            borderRadius: 14,
            transition: "none",
          }}
        />
      </div>

      <div style={{ fontSize: 100, fontWeight: 900, color, lineHeight: 1 }}>
        {Math.round(barWidth)}%
      </div>

      {subLabel && (
        <div style={{ fontSize: 44, fontWeight: 600, color: "#888", marginTop: 20 }}>
          {subLabel}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Haupt-Export ──────────────────────────────────────────────────────────────
export const BRollMotion: React.FC<BRollMotionProps & { durationMs?: number }> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round(((props.durationMs ?? 5000) / 1000) * fps);

  if (props.variant === "before-after") {
    return <BeforeAfter {...props} frame={frame} fps={fps} />;
  }
  if (props.variant === "arrow-flow") {
    return <ArrowFlow {...props} frame={frame} fps={fps} />;
  }
  if (props.variant === "counter") {
    return <Counter {...props} frame={frame} fps={fps} totalFrames={totalFrames} />;
  }
  if (props.variant === "progress") {
    return <Progress {...props} frame={frame} fps={fps} totalFrames={totalFrames} />;
  }
  return null;
};
