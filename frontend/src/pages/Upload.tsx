import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { VideoDropzone } from "../components/VideoDropzone";
import { analyzeJob, deleteJob, listJobs, transcribeJob, uploadVideo, type JobSummary } from "../lib/api";

type Step = "idle" | "uploading" | "analyzing" | "transcribing" | "done" | "error";

const STEPS: { key: Step; label: string }[] = [
  { key: "uploading", label: "Upload" },
  { key: "analyzing", label: "Analyse" },
  { key: "transcribing", label: "Transkript" },
  { key: "done", label: "Fertig" },
];

const STEP_ORDER: Step[] = ["uploading", "analyzing", "transcribing", "done"];

function stepIndex(step: Step): number {
  return STEP_ORDER.indexOf(step);
}

function formatAge(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  return `vor ${Math.floor(h / 24)} Tag(en)`;
}

function formatDuration(ms?: number): string {
  if (!ms) return "";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const STATUS_DOT: Record<string, string> = {
  done: "done",
  error: "error",
  rendering: "rendering",
  ready: "ready",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Fertig",
  error: "Fehler",
  rendering: "Rendering",
  ready: "Bereit",
};

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"de" | "en">("de");
  const [step, setStep] = useState<Step>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);

  useEffect(() => {
    listJobs().then(setRecentJobs).catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setUploadPct(0);
    try {
      setStep("uploading");
      const { jobId } = await uploadVideo(file, language, setUploadPct);

      setStep("analyzing");
      await analyzeJob(jobId);

      setStep("transcribing");
      await transcribeJob(jobId, language);

      setStep("done");
      navigate(`/editor/${jobId}`);
    } catch (err) {
      setStep("error");
      setError(String(err));
    }
  };

  const handleDelete = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteJob(jobId);
    setRecentJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const isLoading = step !== "idle" && step !== "error";
  const currentStepIdx = stepIndex(step);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(96,165,250,0.18) 100%)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-bold tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            AutoClip
          </motion.h1>

          <motion.p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            Stille entfernen · Captions generieren · B-Rolls hinzufügen
          </motion.p>
        </div>

        {/* Language Toggle */}
        <motion.div
          className="flex gap-2 mb-6 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {(["de", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: language === lang ? "white" : "transparent",
                color: language === lang ? "var(--accent)" : "var(--text-muted)",
                boxShadow: language === lang ? "0 1px 4px rgba(37,99,235,0.12)" : "none",
                border: language === lang ? "1px solid var(--border-strong)" : "1px solid transparent",
              }}
            >
              {lang === "de" ? "🇩🇪  Deutsch" : "🇬🇧  English"}
            </button>
          ))}
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
        >
          <VideoDropzone onFile={handleFile} disabled={isLoading} />
        </motion.div>

        {/* Progress Steps */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="mt-8 glass-surface p-5 space-y-4"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => {
                  const isDone = currentStepIdx > i;
                  const isActive = STEP_ORDER[currentStepIdx] === s.key;
                  const isPending = currentStepIdx < i;

                  return (
                    <React.Fragment key={s.key}>
                      <div className="flex flex-col items-center gap-1.5">
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          animate={{
                            background: isDone
                              ? "var(--success)"
                              : isActive
                              ? "var(--accent)"
                              : "rgba(148,163,184,0.15)",
                            color: isDone || isActive ? "#fff" : "var(--text-muted)",
                            scale: isActive ? [1, 1.05, 1] : 1,
                          }}
                          transition={isActive ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : { duration: 0.3 }}
                          style={{ border: isActive ? "2px solid rgba(37,99,235,0.3)" : "2px solid transparent" }}
                        >
                          {isDone ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </motion.div>
                        <span
                          className="text-[10px] font-medium"
                          style={{
                            color: isDone ? "var(--success)" : isActive ? "var(--accent)" : "var(--text-muted)",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>

                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-px mx-2 relative overflow-hidden" style={{ background: "var(--border)" }}>
                          <motion.div
                            className="absolute inset-y-0 left-0 h-full"
                            style={{ background: "var(--accent)" }}
                            animate={{ width: isDone ? "100%" : "0%" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Upload Progress Bar */}
              <AnimatePresence>
                {step === "uploading" && uploadPct > 0 && uploadPct < 100 && (
                  <motion.div
                    className="space-y-1.5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex justify-between">
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Upload</span>
                      <span className="text-[10px] font-mono" style={{ color: "var(--accent)" }}>{uploadPct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--accent)" }}
                        animate={{ width: `${uploadPct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 rounded-2xl px-4 py-3 text-sm"
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

        {/* Recent Jobs */}
        <AnimatePresence>
          {recentJobs.length > 0 && !isLoading && (
            <motion.div
              className="mt-8 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-3 font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                Letzte Jobs
              </p>
              {recentJobs.slice(0, 5).map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                  className="group relative"
                >
                  <Link
                    to={`/editor/${job.id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.6)";
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`status-dot ${STATUS_DOT[job.status] ?? "pending"}`} />
                      <span
                        className="text-xs font-medium font-mono truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {job.id.slice(0, 8)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_LABEL[job.status] ?? job.status}
                      </span>
                      {job.durationMs && (
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {formatDuration(job.durationMs)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {formatAge(job.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, job.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-md"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--error)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                        title="Job löschen"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
