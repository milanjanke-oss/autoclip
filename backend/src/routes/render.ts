import { Router } from "express";
import path from "path";
import { UPLOADS_DIR } from "../config";
import type { BRollSegment, CaptionStyle } from "../services/jobStore";
import { jobStore } from "../services/jobStore";
import { getBestVideoFile, searchPexelsVideos } from "../services/pexels";
import { renderShortVideo } from "../services/remotionRender";

export const renderRouter = Router();

const DEFAULT_CAPTION_STYLE: CaptionStyle = {
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

const ALLOWED_BROLL_HOSTS = /^https:\/\/(?!(?:localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+))/i;

function sanitizeBrollUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (!ALLOWED_BROLL_HOSTS.test(url)) return null;
    return url;
  } catch {
    return null;
  }
}

async function resolveBrollUrls(segments: BRollSegment[]): Promise<BRollSegment[]> {
  return Promise.all(
    segments.map(async (seg) => {
      if (seg.resolvedVideoUrl) {
        const safe = sanitizeBrollUrl(seg.resolvedVideoUrl);
        return safe ? { ...seg, resolvedVideoUrl: safe } : { ...seg, resolvedVideoUrl: undefined };
      }
      if (!seg.pexelsQuery) return seg;
      const videos = await searchPexelsVideos(seg.pexelsQuery, "portrait", 3);
      const url = videos.length > 0 ? getBestVideoFile(videos[0]) : null;
      return url ? { ...seg, resolvedVideoUrl: url } : seg;
    })
  );
}

renderRouter.post("/:jobId", async (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  if (!job.captions || !job.silenceSegments || !job.durationMs) {
    res.status(400).json({ error: "Job nicht vollständig analysiert/transkribiert" });
    return;
  }
  if (job.status === "rendering") {
    res.json({ status: "rendering" });
    return;
  }

  const brollSegments: BRollSegment[] = req.body.brollSegments ?? [];
  const captionStyle: CaptionStyle = {
    ...DEFAULT_CAPTION_STYLE,
    ...(req.body.captionStyle ?? {}),
  };

  const outputPath = path.join(path.dirname(job.videoPath), "output.mp4");
  jobStore.update(job.id, { status: "rendering", brollSegments, captionStyle });

  res.json({ status: "rendering" });

  resolveBrollUrls(brollSegments)
    .then((resolvedSegments) =>
      renderShortVideo({
        videoPath: job.videoPath,
        captions: job.captions!,
        silenceSegments: job.silenceSegments!,
        durationMs: job.durationMs!,
        brollSegments: resolvedSegments,
        captionStyle,
        outputPath,
      })
    )
    .then(() => jobStore.update(job.id, { status: "done", outputPath }))
    .catch((err) =>
      jobStore.update(job.id, { status: "error", error: String(err) })
    );
});

renderRouter.get("/:jobId/status", (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  const relativeVideoPath = path.relative(UPLOADS_DIR, job.videoPath).replace(/\\/g, "/");
  res.json({
    status: job.status,
    error: job.error,
    language: job.language,
    videoUrl: `/uploads/${relativeVideoPath}`,
    outputPath: job.status === "done" ? `/uploads/${job.id}/output.mp4` : undefined,
  });
});

renderRouter.get("/:jobId/pexels", async (req, res) => {
  const query = String(req.query.q ?? "").trim();
  if (!query) {
    res.json([]);
    return;
  }
  try {
    const videos = await searchPexelsVideos(query, "portrait", 5);
    const results = videos
      .map((v) => {
        const url = getBestVideoFile(v);
        const thumb =
          v.video_files?.find((f) => f.quality === "sd")?.link ?? url;
        return url ? { url, thumbnail: thumb ?? url } : null;
      })
      .filter(Boolean);
    res.json(results);
  } catch {
    res.json([]);
  }
});

renderRouter.patch("/:jobId", (req, res) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job nicht gefunden" });
    return;
  }
  const updates: Partial<typeof job> = {};
  if (req.body.captionStyle) updates.captionStyle = req.body.captionStyle;
  if (req.body.brollSegments) updates.brollSegments = req.body.brollSegments;
  jobStore.update(job.id, updates);
  res.json({ ok: true });
});
