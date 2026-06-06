import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BRollScreenProps {
  screenSrc: string;
  label?: string;
  zoomTarget?: { x: number; y: number; scale: number; startMs: number };
  durationMs?: number;
}

export const BRollScreen: React.FC<BRollScreenProps> = ({
  screenSrc,
  label,
  zoomTarget,
  durationMs = 6000,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round((durationMs / 1000) * fps);

  const mountSpring = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });
  const containerScale = interpolate(mountSpring, [0, 1], [0.92, 1]);
  const containerOpacity = interpolate(mountSpring, [0, 0.4, 1], [0, 1, 1]);

  // Zoom-in Effekt wenn zoomTarget gesetzt
  let videoScale = 1;
  let videoOriginX = "50%";
  let videoOriginY = "50%";

  if (zoomTarget) {
    const zoomStartFrame = Math.round((zoomTarget.startMs / 1000) * fps);
    const zoomProgress = interpolate(
      frame,
      [zoomStartFrame, zoomStartFrame + fps * 0.6],
      [1, zoomTarget.scale],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    videoScale = zoomProgress;
    videoOriginX = `${zoomTarget.x * 100}%`;
    videoOriginY = `${zoomTarget.y * 100}%`;
  }

  const labelSpring = spring({
    fps,
    frame: frame - fps * 0.5,
    config: { damping: 14, stiffness: 100 },
  });
  const labelY = interpolate(labelSpring, [0, 1], [20, 0]);
  const labelOpacity = interpolate(labelSpring, [0, 0.5, 1], [0, 1, 1]);

  const fadeOut = interpolate(
    frame,
    [totalFrames - fps * 0.2, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#111", alignItems: "center", justifyContent: "center" }}>
      {/* Browser-Rahmen */}
      <div
        style={{
          width: "88%",
          height: "80%",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          transform: `scale(${containerScale})`,
          opacity: containerOpacity * fadeOut,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser-Chrome (Titelleiste) */}
        <div
          style={{
            background: "#1e1e1e",
            height: 52,
            display: "flex",
            alignItems: "center",
            paddingLeft: 20,
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840" }} />
          <div
            style={{
              marginLeft: 16,
              background: "#2a2a2a",
              borderRadius: 8,
              height: 30,
              flex: 1,
              marginRight: 20,
            }}
          />
        </div>

        {/* Screen-Recording */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <OffthreadVideo
            src={screenSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${videoScale})`,
              transformOrigin: `${videoOriginX} ${videoOriginY}`,
              transition: "transform 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Label unten */}
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            transform: `translateY(${labelY}px)`,
            opacity: labelOpacity * fadeOut,
          }}
        >
          <div
            style={{
              background: "#FFE600",
              color: "#0a0a0a",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 36,
              padding: "12px 32px",
              borderRadius: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
