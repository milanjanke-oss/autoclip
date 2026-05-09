import { Router } from "express";
import { analyzeSilence } from "../services/silence";
import { jobStore } from "../services/jobStore";

export const analyzeRouter = Router();

analyzeRouter.post("/:jobId", async (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }

  const noiseDb = parseFloat(req.body.noiseDb ?? "-40");
  const minDuration = parseFloat(req.body.minDuration ?? "0.5");

  jobStore.update(job.id, { status: "analyzing" });

  try {
    const { silenceSegments, durationMs } = await analyzeSilence(
      job.videoPath,
      noiseDb,
      minDuration
    );
    jobStore.update(job.id, { silenceSegments, durationMs });
    res.json({ silenceSegments, durationMs });
  } catch (err) {
    jobStore.update(job.id, { status: "error", error: String(err) });
    res.status(500).json({ error: "Analyse fehlgeschlagen" });
  }
});

analyzeRouter.get("/:jobId", (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  res.json({
    status: job.status,
    silenceSegments: job.silenceSegments,
    durationMs: job.durationMs,
    error: job.error,
  });
});
