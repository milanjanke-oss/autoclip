import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BRollPanel, type BRollSegment } from "../components/BRollPanel";
import { CaptionStylePicker } from "../components/CaptionStylePicker";
import { EditorHint } from "../components/EditorHint";
import { VideoPreview } from "../components/VideoPreview";
import { analyzeJob, getAnalysis, getJobStatus, getTranscription, renderJob, transcribeJob } from "../lib/api";
import type { CaptionStyle, Word } from "../types";

type Tab = "captions" | "brolls" | "settings";

interface Settings {
  noiseDb: number;
  minDuration: number;
}

const DEFAULT_STYLE: CaptionStyle = {
  color: "#ffffff",
  highlightColor: "#FFE600",
  fontSize: 78,
  position: "bottom",
  wordsPerChunk: 3,
  variant: "classic",
  fontFamily: "Montserrat",
  highlightMode: "color",
  strokeColor: "#000000",
  strokeWidth: 3,
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "captions",
    label: "Captions",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: "brolls",
    label: "B-Rolls",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Einstellungen",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
      </svg>
    ),
  },
];

export const EditorPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("captions");
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(DEFAULT_STYLE);
  const [brollSegments, setBrollSegments] = useState<BRollSegment[]>([]);
  const [settings, setSettings] = useState<Settings>({ noiseDb: -40, minDuration: 0.5 });
  const [transcriptPreview, setTranscriptPreview] = useState<string>("");
  const [captionWords, setCaptionWords] = useState<Word[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<string>("Rendering...");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeMsg, setReanalyzeMsg] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [silenceSegments, setSilenceSegments] = useState<{ startMs: number; endMs: number }[]>([]);
  const [durationMs, setDurationMs] = useState<number | undefined>(undefined);
  const [jobLanguage, setJobLanguage] = useState<"de" | "en">("de");
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    getTranscription(jobId)
      .then((d) => {
        setTranscriptPreview(d.captions?.text ?? "");
        setCaptionWords(d.captions?.words ?? []);
      })
      .catch(() => {});
    getJobStatus(jobId)
      .then((s) => {
        setVideoUrl(s.videoUrl ?? null);
        if (s.language) setJobLanguage(s.language);
        if (s.outputPath) setDownloadUrl(s.outputPath);
      })
      .catch(() => {});
    getAnalysis(jobId)
      .then((a) => {
        if (a.silenceSegments) setSilenceSegments(a.silenceSegments);
        if (a.durationMs) setDurationMs(a.durationMs);
      })
      .catch(() => {});
  }, [jobId]);

  const handleReanalyze = async () => {
    if (!jobId) return;
    setIsReanalyzing(true);
    setReanalyzeMsg(null);
    try {
      await analyzeJob(jobId, { noiseDb: settings.noiseDb, minDuration: settings.minDuration });
      const analysis = await getAnalysis(jobId);
      if (analysis.silenceSegments) setSilenceSegments(analysis.silenceSegments);
      if (analysis.durationMs) setDurationMs(analysis.durationMs);
      setReanalyzeMsg("Analyse aktualisiert.");
    } catch {
      setReanalyzeMsg("Fehler beim Neuanalysieren.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleRetryTranscription = async () => {
    if (!jobId) return;
    setIsRetrying(true);
    setError(null);
    try {
      await transcribeJob(jobId, jobLanguage);
      const d = await getTranscription(jobId);
      setTranscriptPreview(d.captions?.text ?? "");
      setCaptionWords(d.captions?.words ?? []);
    } catch {
      setError("Transkription erneut fehlgeschlagen.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRender = async () => {
    if (!jobId) return;
    setIsRendering(true);
    setError(null);
    setDownloadUrl(null);

    try {
      await renderJob(jobId, captionStyle, brollSegments);

      const poll = setInterval(async () => {
        const status = await getJobStatus(jobId);
        setRenderProgress(
          status.status === "rendering" ? "Rendering läuft..." : status.status
        );
        if (status.status === "done") {
          clearInterval(poll);
          setDownloadUrl(status.outputPath ?? null);
          setIsRendering(false);
        }
        if (status.status === "error") {
          clearInterval(poll);
          setError(status.error ?? "Rendering fehlgeschlagen");
          setIsRendering(false);
        }
      }, 2500);
    } catch (err) {
      setError(String(err));
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Zurück
        </Link>

        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(96,165,250,0.15) 100%)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Nachbearbeiten
            </h1>
            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
              Job {jobId?.slice(0, 8)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <EditorHint />

        {/* Video Preview */}
        {videoUrl && (
          <div className="glass-surface overflow-hidden p-4">
            <VideoPreview
              src={videoUrl}
              words={captionWords}
              captionStyle={captionStyle}
              silenceSegments={silenceSegments}
              durationMs={durationMs}
            />
          </div>
        )}

        {/* Retry Transkription */}
        {!transcriptPreview && (
          <motion.div
            className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Kein Transkript vorhanden.
            </span>
            <button
              onClick={handleRetryTranscription}
              disabled={isRetrying}
              className="btn-secondary px-3 py-1.5 text-xs shrink-0"
            >
              {isRetrying ? "Läuft..." : "Erneut versuchen"}
            </button>
          </motion.div>
        )}

        {/* Transcript */}
        {transcriptPreview && (
          <div className="glass-card px-5 py-4">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2 font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Transkript
            </p>
            <p className="text-sm leading-relaxed line-clamp-4" style={{ color: "var(--text-secondary)" }}>
              {transcriptPreview}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="glass-surface p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "captions" && (
              <CaptionStylePicker value={captionStyle} onChange={setCaptionStyle} />
            )}

            {activeTab === "brolls" && jobId && (
              <BRollPanel
                jobId={jobId}
                segments={brollSegments}
                onChange={setBrollSegments}
              />
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Stille-Schwelle
                    </span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                    >
                      {settings.noiseDb} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={-20}
                    value={settings.noiseDb}
                    onChange={(e) => setSettings({ ...settings, noiseDb: Number(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Niedrigerer Wert = nur laute Stille wird geschnitten
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Min. Stille-Dauer
                    </span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                    >
                      {settings.minDuration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3}
                    step={0.1}
                    value={settings.minDuration}
                    onChange={(e) => setSettings({ ...settings, minDuration: Number(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Pausen kürzer als dieser Wert bleiben erhalten
                  </p>
                </div>

                <button
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                  className="btn-secondary w-full py-2.5 text-sm"
                >
                  {isReanalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin inline-block"
                        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                      />
                      Analysiere...
                    </span>
                  ) : (
                    "Neu analysieren"
                  )}
                </button>

                <AnimatePresence>
                  {reanalyzeMsg && (
                    <motion.p
                      className="text-xs text-center"
                      style={{ color: reanalyzeMsg.startsWith("Fehler") ? "var(--error)" : "var(--success)" }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {reanalyzeMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Export */}
        <div className="space-y-3 pb-10">
          <AnimatePresence>
            {error && (
              <motion.div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(220,38,38,0.07)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  color: "var(--error)",
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {downloadUrl ? (
            <motion.a
              href={downloadUrl}
              download="autoclip-output.mp4"
              className="block w-full py-4 rounded-2xl text-center font-semibold text-base transition-all"
              style={{
                background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                color: "white",
                boxShadow: "0 4px 20px rgba(22,163,74,0.25)",
                textDecoration: "none",
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01, boxShadow: "0 6px 28px rgba(22,163,74,0.35)" }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Video herunterladen
              </span>
            </motion.a>
          ) : (
            <motion.button
              onClick={handleRender}
              disabled={isRendering}
              className="btn-primary w-full py-4 rounded-2xl text-base"
              whileHover={!isRendering ? { scale: 1.01 } : {}}
              whileTap={!isRendering ? { scale: 0.99 } : {}}
            >
              {isRendering ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                  {renderProgress}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Video exportieren
                </span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
