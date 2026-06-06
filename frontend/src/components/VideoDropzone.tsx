import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export const VideoDropzone: React.FC<Props> = ({ onFile, disabled }) => {
  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) onFile(files[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".m4v"],
      "video/quicktime": [".mov"],
      "video/mp4": [".mp4", ".m4v"],
    },
    maxFiles: 1,
    disabled,
  });

  const { onAnimationStart: _oas, ...safeRootProps } = getRootProps();

  return (
    <div
      {...safeRootProps}
      className="relative rounded-2xl p-12 text-center select-none overflow-hidden"
      style={{
        border: `2px dashed ${isDragActive ? "var(--accent)" : "rgba(59,130,246,0.22)"}`,
        background: isDragActive ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.5)",
        backdropFilter: "blur(12px)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      <input {...getInputProps()} />

      {/* Drag-active glow ring */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: "2px solid var(--accent)" }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Glow bg */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)",
          opacity: isDragActive ? 1 : 0,
          transition: "opacity 0.25s",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: isDragActive ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.07)",
            border: "1px solid rgba(59,130,246,0.18)",
            transition: "background 0.2s, transform 0.2s",
            transform: isDragActive ? "scale(1.08)" : "scale(1)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isDragActive ? (
              <>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </>
            ) : (
              <>
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </>
            )}
          </svg>
        </div>

        <p
          className="text-base font-semibold mb-1"
          style={{
            color: isDragActive ? "var(--accent)" : "var(--text-primary)",
            transition: "color 0.2s",
          }}
        >
          {isDragActive
            ? "Video loslassen..."
            : <><span className="hidden sm:inline">Video ablegen oder </span><span style={{ color: "var(--accent)" }}>auswählen</span></>
          }
        </p>
        <p className="text-sm sm:hidden" style={{ color: "var(--text-muted)" }}>
          MP4 · MOV · M4V
        </p>
        <p className="text-sm hidden sm:block" style={{ color: "var(--text-muted)" }}>
          oder <span style={{ color: "var(--accent)", fontWeight: 500 }}>Datei auswählen</span>
        </p>
        <p className="text-xs mt-3 font-mono hidden sm:block" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
          MP4 · MOV · AVI · WEBM · max. 1 GB
        </p>
      </div>
    </div>
  );
};
