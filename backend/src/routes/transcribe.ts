import { Router } from "express";
import { jobStore } from "../services/jobStore";
import { transcribeVideo } from "../services/whisper";

export const transcribeRouter = Router();

transcribeRouter.post("/:jobId", async (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }

  jobStore.update(job.id, { status: "transcribing" });

  try {
    const language = (req.body.language as "de" | "en") || job.language;
    const captions = await transcribeVideo(job.videoPath, language);
    jobStore.update(job.id, { captions, status: "ready", language });
    res.json({ captions });
  } catch (err) {
    jobStore.update(job.id, { status: "error", error: String(err) });
    res.status(500).json({ error: "Transkription fehlgeschlagen" });
  }
});

transcribeRouter.get("/:jobId", (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  res.json({ status: job.status, captions: job.captions, error: job.error });
});
