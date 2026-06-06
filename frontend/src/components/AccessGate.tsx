import React, { useState } from "react";
import { motion } from "framer-motion";
import { hasAccessCode, setAccessCode } from "../lib/auth";

export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(hasAccessCode());
  const [code, setCode] = useState("");

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setAccessCode(code);
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.form
        onSubmit={submit}
        className="glass-surface w-full max-w-sm p-8 space-y-5 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "var(--accent-light)", border: "1px solid var(--border)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <div>
          <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            AutoClip
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Zugangscode eingeben
          </p>
        </div>

        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Zugangscode"
          autoFocus
          className="w-full px-4 py-3 rounded-xl text-center text-sm font-mono outline-none"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />

        <button type="submit" className="btn-primary w-full py-3 rounded-xl text-sm">
          Entsperren
        </button>
      </motion.form>
    </div>
  );
};
