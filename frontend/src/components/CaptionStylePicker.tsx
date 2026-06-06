import React from "react";
import { motion } from "framer-motion";
import type { CaptionStyle, CaptionVariant } from "../types";
import { FONT_OPTIONS, fontCss } from "../lib/fonts";

export type { CaptionStyle };

interface StylePreset {
  label: string;
  description: string;
  variant: CaptionVariant;
  style: CaptionStyle;
}

const PRESETS: StylePreset[] = [
  {
    label: "Classic",
    description: "Weiß + Highlight",
    variant: "classic",
    style: { color: "#ffffff", highlightColor: "#FFE600", fontSize: 78, position: "bottom", wordsPerChunk: 3, variant: "classic" },
  },
  {
    label: "TikTok Box",
    description: "Wort im Kasten",
    variant: "box",
    style: { color: "#ffffffcc", highlightColor: "#FF3B5C", fontSize: 72, position: "bottom", wordsPerChunk: 2, variant: "box" },
  },
  {
    label: "Outline",
    description: "Mit Rand",
    variant: "outline",
    style: { color: "#ffffff", highlightColor: "#00E5FF", fontSize: 76, position: "bottom", wordsPerChunk: 3, variant: "outline" },
  },
  {
    label: "Minimal",
    description: "Dezent & klein",
    variant: "minimal",
    style: { color: "#cbd5e1", highlightColor: "#ffffff", fontSize: 72, position: "bottom", wordsPerChunk: 4, variant: "minimal" },
  },
  {
    label: "Neon",
    description: "Leuchtend",
    variant: "neon",
    style: { color: "#00FF94", highlightColor: "#FF00E5", fontSize: 76, position: "bottom", wordsPerChunk: 3, variant: "neon" },
  },
];

function PreviewCard({ preset, active, fontFamily, onClick }: { preset: StylePreset; active: boolean; fontFamily?: string; onClick: () => void }) {
  const { variant, style } = preset;

  const wordStyle = (highlight: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: fontCss(fontFamily),
      fontWeight: 900,
      letterSpacing: "-0.5px",
      display: "inline-block",
      fontSize: 11,
    };
    switch (variant) {
      case "box":
        return { ...base, fontWeight: 800, borderRadius: 4, padding: "1px 5px",
          background: highlight ? style.highlightColor : "rgba(0,0,0,0.4)",
          color: highlight ? "#111" : style.color };
      case "outline":
        return { ...base, textTransform: "uppercase",
          color: highlight ? style.highlightColor : style.color,
          WebkitTextStroke: "0.5px rgba(0,0,0,0.9)" };
      case "minimal":
        return { ...base, fontWeight: 600, textTransform: "none", fontSize: 9,
          color: highlight ? "#ffffff" : style.color, opacity: highlight ? 1 : 0.6 };
      case "neon":
        return { ...base, textTransform: "uppercase",
          color: highlight ? style.highlightColor : style.color,
          filter: highlight ? `drop-shadow(0 0 4px ${style.highlightColor})` : "none" };
      default:
        return { ...base, textTransform: "uppercase",
          color: highlight ? style.highlightColor : style.color,
          textShadow: "0 1px 4px rgba(0,0,0,0.8)" };
    }
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        border: active ? "2px solid var(--accent)" : "2px solid var(--border)",
        background: active ? "var(--accent-light)" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {/* Visual Preview */}
      <div
        className="w-full flex items-end justify-center pb-3 pt-2"
        style={{
          background: "linear-gradient(180deg, #0f0f1e 0%, #1a1030 60%, #0a0a14 100%)",
          height: 64,
          gap: 4,
        }}
      >
        {["DEIN", "TEXT", "HIER"].map((w, i) => (
          <span key={i} style={wordStyle(i === 1)}>{w}</span>
        ))}
      </div>

      {/* Label */}
      <div className="px-3 py-2 text-left">
        <p className="text-xs font-semibold" style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}>
          {preset.label}
        </p>
        <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
          {preset.description}
        </p>
      </div>

      {active && (
        <div
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}

interface Props {
  value: CaptionStyle;
  onChange: (s: CaptionStyle) => void;
}

export const CaptionStylePicker: React.FC<Props> = ({ value, onChange }) => {
  const activeVariant = value.variant ?? "classic";

  return (
    <div className="space-y-6">
      {/* Style Presets */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3 font-mono" style={{ color: "var(--text-muted)" }}>
          Stil wählen
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <PreviewCard
              key={p.variant}
              preset={p}
              active={activeVariant === p.variant}
              fontFamily={value.fontFamily}
              onClick={() => onChange({ ...value, ...p.style })}
            />
          ))}
        </div>
      </div>

      {/* Schriftart */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>
          Schriftart
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {FONT_OPTIONS.map((font) => {
            const active = (value.fontFamily ?? "Montserrat") === font;
            return (
              <button
                key={font}
                onClick={() => onChange({ ...value, fontFamily: font })}
                className="py-2 px-1 rounded-xl text-sm leading-tight transition-all"
                style={{
                  fontFamily: fontCss(font),
                  background: active ? "var(--accent-light)" : "rgba(255,255,255,0.6)",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
                }}
              >
                {font}
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlight-Modus: Farbe oder Umrandung */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Wort-Hervorhebung</p>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}>
          {([
            { mode: "color", label: "Farbe" },
            { mode: "outline", label: "Umrandung" },
          ] as const).map(({ mode, label }) => {
            const active = (value.highlightMode ?? "color") === mode;
            return (
              <button
                key={mode}
                onClick={() => onChange({ ...value, highlightMode: mode })}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "white" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
                  boxShadow: active ? "0 1px 4px rgba(37,99,235,0.1)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rand-Optionen (nur bei Umrandung) */}
      {(value.highlightMode ?? "color") === "outline" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Rand-Farbe</p>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}>
              <div className="relative w-7 h-7 shrink-0">
                <input type="color" value={(value.strokeColor ?? "#000000").slice(0, 7)} onChange={(e) => onChange({ ...value, strokeColor: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-7 h-7 rounded-lg pointer-events-none" style={{ background: value.strokeColor ?? "#000000", border: "2px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} />
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{(value.strokeColor ?? "#000000").slice(0, 7)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Rand-Dicke</p>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{value.strokeWidth ?? 3}px</span>
            </div>
            <input type="range" min={1} max={8} value={value.strokeWidth ?? 3} onChange={(e) => onChange({ ...value, strokeWidth: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
      )}

      {/* Color Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Textfarbe</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}>
            <div className="relative w-7 h-7 shrink-0">
              <input type="color" value={value.color.slice(0, 7)} onChange={(e) => onChange({ ...value, color: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-7 h-7 rounded-lg border pointer-events-none" style={{ background: value.color, border: "2px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{value.color.slice(0, 7)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Highlight</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}>
            <div className="relative w-7 h-7 shrink-0">
              <input type="color" value={value.highlightColor} onChange={(e) => onChange({ ...value, highlightColor: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-7 h-7 rounded-lg pointer-events-none" style={{ background: value.highlightColor, border: "2px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{value.highlightColor}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Schriftgröße</p>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{value.fontSize}px</span>
          </div>
          <input type="range" min={48} max={120} value={value.fontSize} onChange={(e) => onChange({ ...value, fontSize: Number(e.target.value) })} className="w-full" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Wörter/Zeile</p>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{value.wordsPerChunk}</span>
          </div>
          <input type="range" min={1} max={5} value={value.wordsPerChunk} onChange={(e) => onChange({ ...value, wordsPerChunk: Number(e.target.value) })} className="w-full" />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Position</p>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}>
          {(["top", "middle", "bottom"] as const).map((pos) => {
            const labels = { top: "Oben", middle: "Mitte", bottom: "Unten" };
            const active = value.position === pos;
            return (
              <button
                key={pos}
                onClick={() => onChange({ ...value, position: pos })}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "white" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
                  boxShadow: active ? "0 1px 4px rgba(37,99,235,0.1)" : "none",
                }}
              >
                {labels[pos]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
