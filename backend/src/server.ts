import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });
import cors from "cors";
import express from "express";
import fs from "fs";
import { UPLOADS_DIR } from "./config";
import { rm } from "fs/promises";
import { analyzeRouter } from "./routes/analyze";
import { renderRouter } from "./routes/render";
import { transcribeRouter } from "./routes/transcribe";
import { uploadRouter } from "./routes/upload";
import { jobStore } from "./services/jobStore";

const app = express();
const PORT = process.env.PORT || 4000;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
jobStore.init(UPLOADS_DIR);

const ALLOWED_ORIGINS = [
  "https://autoclip-dlmj.netlify.app",
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS: Origin nicht erlaubt"));
    }
  },
}));
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

app.delete("/jobs/:jobId", async (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  jobStore.delete(job.id);
  const jobDir = path.join(UPLOADS_DIR, job.id);
  await rm(jobDir, { recursive: true, force: true }).catch(() => {});
  res.json({ ok: true });
});

app.use("/upload", uploadRouter);
app.use("/transcribe", transcribeRouter);
app.use("/analyze", analyzeRouter);
app.use("/render", renderRouter);

app.listen(PORT, () => {
  console.log(`AutoClip backend running on port ${PORT}`);
});
