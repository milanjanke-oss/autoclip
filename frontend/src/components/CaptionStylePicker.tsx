import React from "react";
import { motion } from "framer-motion";

export interface CaptionStyle {
  color: string;
  highlightColor: string;
  fontSize: number;
  position: "bottom" | "middle" | "top";
  wordsPerChunk: number;
}

interface Props {
  value: CaptionStyle;
  onChange: (s: CaptionStyle) => void;
}

const PRESETS: { label: string; style: CaptionStyle }[] = [
  {
    label: "Classic White",
    style: { color: "#ffffff", highlightColor: "#FFE600", fontSize: 78, position: "bottom", wordsPerChunk: 3 },
  },
  {
    label: "Neon Yellow",
    style: { color: "#FFE600", highlightColor: "#ffffff", fontSize: 72, position: "bottom", wordsPerChunk: 3 },
  },
  {
    label: "Bold Orange",
    style: { color: "#ffffff", highlightColor: "#FF6B00", fontSize: 80, position: "bottom", wordsPerChunk: 2 },
  },
];

export const CaptionStylePicker: React.FC<Props> = ({ value, onChange }) => {
  const isActivePreset = (preset: CaptionStyle) =>
    preset.color === value.color && preset.highlightColor === value.highlightColor;

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3 font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          Stil-Vorlagen
        </p>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => {
            const active = isActivePreset(p.style);
            return (
              <button
                key={p.label}
                onClick={() => onChange(p.style)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? "var(--accent-light)" : "rgba(255,255,255,0.6)",
                  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Textfarbe</p>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}
          >
            <div className="relative w-7 h-7 shrink-0">
              <input
                type="color"
                value={value.color}
                onChange={(e) => onChange({ ...value, color: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-7 h-7 rounded-lg border pointer-events-none"
                style={{
                  background: value.color,
                  border: "2px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {value.color}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Highlight</p>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}
          >
            <div className="relative w-7 h-7 shrink-0">
              <input
                type="color"
                value={value.highlightColor}
                onChange={(e) => onChange({ ...value, highlightColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-7 h-7 rounded-lg pointer-events-none"
                style={{
                  background: value.highlightColor,
                  border: "2px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {value.highlightColor}
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Schriftgröße</p>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {value.fontSize}px
            </span>
          </div>
          <input
            type="range"
            min={48}
            max={120}
            value={value.fontSize}
            onChange={(e) => onChange({ ...value, fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Wörter/Zeile</p>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {value.wordsPerChunk}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={value.wordsPerChunk}
            onChange={(e) => onChange({ ...value, wordsPerChunk: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Position</p>
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}
        >
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

      {/* Preview */}
      <div
        className="rounded-2xl h-28 flex items-end justify-center pb-5 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(100,100,200,0.3) 0%, transparent 70%)",
          }}
        />
        <motion.span
          key={`${value.color}-${value.highlightColor}-${value.fontSize}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: Math.round(value.fontSize * 0.26),
            fontWeight: 900,
            color: value.color,
            textTransform: "uppercase",
            letterSpacing: "-0.5px",
            position: "relative",
            zIndex: 1,
          }}
        >
          DEIN{" "}
          <span style={{ color: value.highlightColor }}>TEXT</span>
          {" "}HIER
        </motion.span>
      </div>
    </div>
  );
};
