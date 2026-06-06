import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BRollQuestionProps {
  question: string;
  asker?: string;
  durationMs?: number;
}

export const BRollQuestion: React.FC<BRollQuestionProps> = ({
  question,
  asker,
  durationMs = 3500,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round((durationMs / 1000) * fps);

  const bgSpring = spring({ fps, frame, config: { damping: 18, stiffness: 70, mass: 1 } });
  const bgScale = interpolate(bgSpring, [0, 1], [0.88, 1]);
  const bgOpacity = interpolate(bgSpring, [0, 0.5, 1], [0, 1, 1]);

  const labelSpring = spring({
    fps,
    frame: frame - fps * 0.2,
    config: { damping: 14, stiffness: 100 },
  });
  const labelY = interpolate(labelSpring, [0, 1], [-20, 0]);
  const labelOpacity = interpolate(labelSpring, [0, 0.4, 1], [0, 1, 1]);

  const questionSpring = spring({
    fps,
    frame: frame - fps * 0.38,
    config: { damping: 16, stiffness: 90, mass: 0.7 },
  });
  const questionY = interpolate(questionSpring, [0, 1], [30, 0]);
  const questionOpacity = interpolate(questionSpring, [0, 0.4, 1], [0, 1, 1]);

  const askerSpring = spring({
    fps,
    frame: frame - fps * 0.55,
    config: { damping: 14, stiffness: 90 },
  });

  const fadeOut = interpolate(
    frame,
    [totalFrames - fps * 0.25, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
        fontFamily: "'Montserrat', sans-serif",
        opacity: fadeOut,
      }}
    >
      {/* Frage-Karte */}
      <div
        style={{
          width: "100%",
          transform: `scale(${bgScale})`,
          opacity: bgOpacity,
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header-Gradient (Instagram Q&A Farben) */}
        <div
          style={{
            background: "linear-gradient(135deg, #6B3FA0 0%, #C13584 50%, #E1306C 100%)",
            padding: "32px 40px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              transform: `translateY(${labelY}px)`,
              opacity: labelOpacity,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 40 }}>❓</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Du hast gefragt
            </span>
          </div>
        </div>

        {/* Frage-Text */}
        <div
          style={{
            background: "#ffffff",
            padding: "44px 40px 40px",
          }}
        >
          <div
            style={{
              transform: `translateY(${questionY}px)`,
              opacity: questionOpacity,
              fontSize: question.length > 60 ? 52 : 64,
              fontWeight: 800,
              color: "#0a0a0a",
              lineHeight: 1.25,
              letterSpacing: -0.5,
            }}
          >
            {question}
          </div>

          {asker && (
            <div
              style={{
                marginTop: 28,
                fontSize: 34,
                fontWeight: 600,
                color: "#888",
                opacity: interpolate(askerSpring, [0, 0.4, 1], [0, 1, 1]),
                transform: `translateY(${interpolate(askerSpring, [0, 1], [14, 0])}px)`,
              }}
            >
              @{asker}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
