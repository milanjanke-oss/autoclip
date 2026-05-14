import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { UPLOADS_DIR } from "../config";
import { jobStore } from "../services/jobStore";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
  fileFilter: (_req, file, cb) => {
    const validMime = file.mimetype.startsWith("video/") || file.mimetype === "application/octet-stream";
    const validExt = /\.(mp4|mov|avi|webm|m4v|hevc)$/i.test(file.originalname);
    cb(null, validMime || validExt);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", upload.single("video"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Keine Videodatei erhalten" });
    return;
  }

  const language = (req.body.language as "de" | "en") || "de";
  const jobId = uuid();
  const jobDir = path.join(UPLOADS_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const destPath = path.join(jobDir, "raw" + path.extname(req.file.filename));
  fs.renameSync(req.file.path, destPath);

  const job = jobStore.create(jobId, {
    status: "uploaded",
    language,
    videoPath: destPath,
  });

  res.json({ jobId: job.id, status: job.status });
});
