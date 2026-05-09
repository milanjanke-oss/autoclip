import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import { UPLOADS_DIR } from "./config";
import { analyzeRouter } from "./routes/analyze";
import { renderRouter } from "./routes/render";
import { transcribeRouter } from "./routes/transcribe";
import { uploadRouter } from "./routes/upload";
import { jobStore } from "./services/jobStore";

const app = express();
const PORT = process.env.PORT || 4000;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
jobStore.init(UPLOADS_DIR);

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/jobs", (_req, res) => {
  const jobs = jobStore.list().map(({ id, status, createdAt, durationMs, error }) => ({
    id,
    status,
    createdAt,
    durationMs,
    error,
  }));
  res.json(jobs);
});

app.use("/upload", uploadRouter);
app.use("/transcribe", transcribeRouter);
app.use("/analyze", analyzeRouter);
app.use("/render", renderRouter);

app.listen(PORT, () => {
  console.log(`AutoClip backend running on port ${PORT}`);
});
