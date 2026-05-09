import React from "react";

export const EditorHint: React.FC = () => (
  <div
    className="flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm"
    style={{
      background: "rgba(37,99,235,0.05)",
      border: "1px solid rgba(59,130,246,0.15)",
    }}
  >
    <div
      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "var(--accent-light)" }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <p style={{ color: "var(--text-secondary)" }}>
      Für Feinschnitt empfehlen wir{" "}
      <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>CapCut</strong>{" "}
      oder{" "}
      <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>DaVinci Resolve</strong>.
      AutoClip übernimmt Stille-Schnitt, Captions und B-Rolls automatisch.
    </p>
  </div>
);
