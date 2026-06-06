import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env") });
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import { UPLOADS_DIR } from "./config";
import { rm } from "fs/promises";
import { analyzeRouter } from "./routes/analyze";
import { renderRouter } from "./routes/render";
import { transcribeRouter } from "./routes/transcribe";
import { uploadRouter } from "./routes/upload";
import { jobStore } from "./services/jobStore";
import { startCleanupSchedule } from "./services/cleanup";

const app = express();
app.set("trust proxy", 1); // hinter Nginx-Reverse-Proxy: echte Client-IP für Rate-Limiting
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === "production";
const ACCESS_CODE = process.env.ACCESS_CODE;

if (IS_PROD && !ACCESS_CODE) {
  console.warn("⚠️  ACCESS_CODE nicht gesetzt — App ist ungeschützt! In .env eintragen.");
}

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
jobStore.init(UPLOADS_DIR);
startCleanupSchedule();

const ALLOWED_ORIGINS = [
  "https://autoclip-dlmj.netlify.app",
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

// Lokale/private Origins nur im Dev erlauben (in Prod strikt auf ALLOWED_ORIGINS)
const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || (!IS_PROD && DEV_ORIGIN_RE.test(origin))) {
      cb(null, true);
    } else {
      cb(new Error("CORS: Origin nicht erlaubt"));
    }
  },
}));
app.use(express.json());

// Zugangscode-Gate: schützt alle mutierenden Aktionen (POST/PUT/PATCH/DELETE).
// GET/HEAD bleiben offen, damit Video-Streaming (/uploads) und Status-Polling funktionieren.
function requireAccess(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  if (!ACCESS_CODE) return next(); // kein Code konfiguriert → offen (nur Dev)
  if (req.header("X-Access-Code") === ACCESS_CODE) return next();
  res.status(401).json({ error: "Zugangscode fehlt oder ungültig" });
}
app.use(requireAccess);

// Rate-Limiting nur für teure POST-Aktionen (GET-Polling bleibt unbegrenzt)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
  message: { error: "Zu viele Anfragen — bitte kurz warten." },
});

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

app.use("/upload", writeLimiter, uploadRouter);
app.use("/transcribe", writeLimiter, transcribeRouter);
app.use("/analyze", analyzeRouter);
app.use("/render", writeLimiter, renderRouter);

const server = app.listen(PORT, () => {
  console.log(`AutoClip backend running on port ${PORT}`);
});
// iOS-Videos können mehrere hundert MB groß sein — 10 Min. Upload-Timeout
server.timeout = 10 * 60 * 1000;
