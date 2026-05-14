import React, { useRef, useState } from "react";
import type { CaptionStyle, CaptionVariant, Word } from "../types";

interface CutPoint { startMs: number; endMs: number; }

function getSpeakingSegments(durationMs: number, silenceSegments: CutPoint[]): CutPoint[] {
  const speaking: CutPoint[] = [];
  let cursor = 0;
  for (const silence of silenceSegments) {
    if (silence.startMs > cursor) speaking.push({ startMs: cursor, endMs: silence.startMs });
    cursor = silence.endMs;
  }
  if (cursor < durationMs) speaking.push({ startMs: cursor, endMs: durationMs });
  return speaking;
}

function remapTimestamp(originalMs: number, speakingSegments: CutPoint[]): number {
  let offset = 0;
  for (const seg of speakingSegments) {
    if (originalMs <= seg.endMs) {
      if (originalMs >= seg.startMs) return offset + (originalMs - seg.startMs);
      return offset;
    }
    offset += seg.endMs - seg.startMs;
  }
  return offset;
}

interface Chunk {
  words: Word[];
  startMs: number;
  endMs: number;
}

function chunkWords(words: Word[], n: number): Chunk[] {
  const chunks: Chunk[] = [];
  for (let i = 0; i < words.length; i += n) {
    const g = words.slice(i, i + n);
    chunks.push({ words: g, startMs: g[0].startMs, endMs: g[g.length - 1].endMs });
  }
  return chunks;
}

const POSITION_BOTTOM: Record<CaptionStyle["position"], string> = {
  bottom: "12%", middle: "45%", top: "78%",
};

function isLightHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.58;
}

function getWordCSS(variant: CaptionVariant, isActive: boolean, wasSpoken: boolean, style: CaptionStyle): React.CSSProperties {
  const fs = style.fontSize * 0.28;
  const base: React.CSSProperties = { fontFamily: "system-ui, sans-serif", display: "inline-block", transition: "all 0.1s ease", fontSize: fs };

  switch (variant) {
    case "box":
      return { ...base, fontWeight: 800, borderRadius: 6, padding: "1px 8px", lineHeight: 1.3,
        background: isActive ? style.highlightColor : "rgba(0,0,0,0.45)",
        color: isActive ? (isLightHex(style.highlightColor) ? "#111" : "#fff") : style.color,
        opacity: wasSpoken ? 0.5 : 1, transform: isActive ? "scale(1.05)" : "scale(1)" };
    case "outline":
      return { ...base, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.5px",
        color: isActive ? style.highlightColor : style.color, opacity: wasSpoken ? 0.55 : 1,
        WebkitTextStroke: "0.8px rgba(0,0,0,0.95)", transform: isActive ? "scale(1.06)" : "scale(1)" };
    case "minimal":
      return { ...base, fontWeight: 600, fontSize: fs * 0.72,
        color: isActive ? "#fff" : style.color, opacity: isActive ? 1 : wasSpoken ? 0.35 : 0.65,
        textShadow: "0 1px 4px rgba(0,0,0,0.8)" };
    case "neon":
      return { ...base, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.5px",
        color: isActive ? style.highlightColor : style.color, opacity: wasSpoken ? 0.4 : 1,
        filter: isActive ? `drop-shadow(0 0 6px ${style.highlightColor})` : "none",
        transform: isActive ? "scale(1.06)" : "scale(1)" };
    default:
      return { ...base, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.5px",
        color: isActive ? style.highlightColor : style.color, opacity: wasSpoken ? 0.55 : 1,
        textShadow: "0 1px 6px rgba(0,0,0,0.9)", transform: isActive ? "scale(1.06)" : "scale(1)" };
  }
}

interface Props {
  src: string;
  words?: Word[];
  captionStyle?: CaptionStyle;
  silenceSegments?: CutPoint[];
  durationMs?: number;
}

export const VideoPreview: React.FC<Props> = ({ src, words, captionStyle, silenceSegments, durationMs }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleTimeUpdate = () => {
    if (ref.current) setCurrentMs(ref.current.currentTime * 1000);
  };

  const variant: CaptionVariant = captionStyle?.variant ?? "classic";

  const remappedWords = React.useMemo(() => {
    if (!words || !silenceSegments?.length || !durationMs) return words ?? [];
    const speaking = getSpeakingSegments(durationMs, silenceSegments);
    return words.map((w) => ({
      ...w,
      startMs: remapTimestamp(w.startMs, speaking),
      endMs: remapTimestamp(w.endMs, speaking),
    }));
  }, [words, silenceSegments, durationMs]);

  const chunks = remappedWords && captionStyle ? chunkWords(remappedWords, captionStyle.wordsPerChunk) : [];
  const activeChunk = chunks.find((c) => currentMs >= c.startMs && currentMs <= c.endMs + 200) ?? null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        {expanded ? "▲ Vorschau ausblenden" : "▼ Vorschau mit Captions"}
      </button>

      {expanded && (
        <div className="relative rounded-xl overflow-hidden" style={{ background: "#000", border: "1px solid var(--border)" }}>
          <video
            ref={ref}
            src={src}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="w-full max-h-[55vw] object-contain block"
            style={{ maxHeight: 380 }}
          />

          {/* Caption Overlay */}
          {activeChunk && captionStyle && (
            <div
              style={{
                position: "absolute",
                bottom: POSITION_BOTTOM[captionStyle.position],
                left: 0,
                right: 0,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: variant === "box" ? "4px" : "6px",
                padding: "0 5%",
                pointerEvents: "none",
              }}
            >
              {activeChunk.words.map((word, i) => {
                const isActive = currentMs >= word.startMs && currentMs <= word.endMs;
                const wasSpoken = currentMs > word.endMs;
                return (
                  <span key={i} style={getWordCSS(variant, isActive, wasSpoken, captionStyle)}>
                    {variant === "box" || variant === "minimal" ? word.text : word.text.toUpperCase()}
                  </span>
                );
              })}
            </div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.65) 85%, rgba(0,0,0,0.85) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </div>
  );
};
