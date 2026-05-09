import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchPexels } from "../lib/api";

export interface BRollSegment {
  startMs: number;
  endMs: number;
  pexelsQuery?: string;
  userFilePath?: string;
  resolvedVideoUrl?: string;
}

interface SearchResult {
  url: string;
  thumbnail: string;
}

interface Props {
  jobId: string;
  segments: BRollSegment[];
  onChange: (segments: BRollSegment[]) => void;
}

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid var(--border-strong)",
  borderRadius: 10,
  color: "var(--text-primary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  padding: "8px 12px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export const BRollPanel: React.FC<Props> = ({ jobId, segments, onChange }) => {
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [searchState, setSearchState] = useState<
    Record<number, { loading: boolean; results: SearchResult[] }>
  >({});

  const addSegment = () => {
    const startMs = parseFloat(newStart) * 1000;
    const endMs = parseFloat(newEnd) * 1000;
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return;
    onChange([...segments, { startMs, endMs }]);
    setNewStart("");
    setNewEnd("");
  };

  const updateSegment = (index: number, patch: Partial<BRollSegment>) => {
    onChange(segments.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSegment = (index: number) => {
    onChange(segments.filter((_, i) => i !== index));
    setSearchState((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSearch = async (index: number, query: string) => {
    if (!query.trim()) return;
    setSearchState((prev) => ({ ...prev, [index]: { loading: true, results: [] } }));
    const results = await searchPexels(jobId, query);
    setSearchState((prev) => ({ ...prev, [index]: { loading: false, results } }));
  };

  const selectVideo = (index: number, url: string) => {
    updateSegment(index, { resolvedVideoUrl: url });
    setSearchState((prev) => ({ ...prev, [index]: { loading: false, results: [] } }));
  };

  return (
    <div className="space-y-4">
      {segments.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
          Noch keine B-Roll-Segmente
        </p>
      )}

      <AnimatePresence>
        {segments.map((seg, i) => {
          const state = searchState[i];
          return (
            <motion.div
              key={i}
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--border)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: seg.resolvedVideoUrl ? "var(--success)" : "var(--text-muted)" }}
                  />
                  <span className="text-sm font-medium font-mono" style={{ color: "var(--text-primary)" }}>
                    {msToTime(seg.startMs)} → {msToTime(seg.endMs)}
                  </span>
                </div>
                <button
                  onClick={() => removeSegment(i)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)", background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--error)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  Entfernen
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pexels-Suche (z.B. 'city night')"
                  value={seg.pexelsQuery ?? ""}
                  onChange={(e) => updateSegment(i, { pexelsQuery: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(i, seg.pexelsQuery ?? "")}
                  style={inputStyle}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = "var(--accent)";
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--accent-glow)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = "var(--border-strong)";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => handleSearch(i, seg.pexelsQuery ?? "")}
                  disabled={state?.loading || !seg.pexelsQuery?.trim()}
                  className="btn-secondary px-3 shrink-0 rounded-xl text-sm"
                  style={{ minWidth: 72 }}
                >
                  {state?.loading ? (
                    <span
                      className="inline-block w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                    />
                  ) : (
                    "Suchen"
                  )}
                </button>
              </div>

              <AnimatePresence>
                {state?.results && state.results.length > 0 && (
                  <motion.div
                    className="grid grid-cols-3 gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {state.results.map((r, ri) => (
                      <button
                        key={ri}
                        onClick={() => selectVideo(i, r.url)}
                        className="relative rounded-xl overflow-hidden aspect-[9/16] transition-all duration-200"
                        style={{
                          border: seg.resolvedVideoUrl === r.url
                            ? "2px solid var(--accent)"
                            : "2px solid var(--border)",
                        }}
                      >
                        <img src={r.thumbnail} alt="" className="w-full h-full object-cover" />
                        {seg.resolvedVideoUrl === r.url && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(37,99,235,0.3)" }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "var(--accent)" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {state?.results?.length === 0 && !state?.loading && Object.keys(searchState).includes(String(i)) && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Keine Ergebnisse für diese Suche.
                </p>
              )}

              {seg.resolvedVideoUrl && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs truncate flex-1 font-mono" style={{ color: "var(--success)" }}>
                    Ausgewählt
                  </span>
                  <button
                    onClick={() => updateSegment(i, { resolvedVideoUrl: undefined })}
                    className="text-xs shrink-0 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--error)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                  >
                    ✕
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* New Segment */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "transparent",
          border: "1.5px dashed var(--border-strong)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-widest font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          Neues Segment
        </p>
        <div className="flex gap-3">
          {[
            { label: "Start (Sek.)", value: newStart, setter: setNewStart, placeholder: "0.0" },
            { label: "Ende (Sek.)", value: newEnd, setter: setNewEnd, placeholder: "5.0" },
          ].map(({ label, value, setter, placeholder }) => (
            <label key={label} className="flex-1 space-y-1.5">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "var(--accent)";
                  (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "var(--border-strong)";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </label>
          ))}
        </div>
        <button
          onClick={addSegment}
          className="btn-secondary w-full py-2.5 text-sm"
        >
          + Segment hinzufügen
        </button>
      </div>
    </div>
  );
};
