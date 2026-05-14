import fs from "fs";
import path from "path";

export type JobStatus =
  | "uploaded"
  | "analyzing"
  | "transcribing"
  | "ready"
  | "rendering"
  | "done"
  | "error";

export interface CutPoint {
  startMs: number;
  endMs: number;
}

export interface Word {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
  emoji?: string;
}

export interface BRollSegment {
  startMs: number;
  endMs: number;
  pexelsQuery?: string;
  userFilePath?: string;
  resolvedVideoUrl?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  error?: string;
  language: "de" | "en";
  videoPath: string;
  durationMs?: number;
  silenceSegments?: CutPoint[];
  captions?: { text: string; words: Word[] };
  brollSegments?: BRollSegment[];
  captionStyle?: CaptionStyle;
  outputPath?: string;
  createdAt: number;
}

export type CaptionVariant = "classic" | "box" | "outline" | "minimal" | "neon";

export interface CaptionStyle {
  color: string;
  highlightColor: string;
  fontSize: number;
  position: "bottom" | "middle" | "top";
  wordsPerChunk: number;
  variant?: CaptionVariant;
}

const jobs = new Map<string, Job>();
let persistDir: string | null = null;

function persist(job: Job): void {
  if (!persistDir) return;
  try {
    const jobDir = path.join(persistDir, job.id);
    fs.mkdirSync(jobDir, { recursive: true });
    fs.writeFileSync(path.join(jobDir, "meta.json"), JSON.stringify(job, null, 2));
  } catch {
    // Non-critical: log and continue
  }
}

const TRANSIENT_STATUSES: JobStatus[] = ["rendering", "analyzing", "transcribing"];

export const jobStore = {
  init(uploadsDir: string): void {
    persistDir = uploadsDir;
    if (!fs.existsSync(uploadsDir)) return;
    const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(uploadsDir, entry.name, "meta.json");
      if (!fs.existsSync(metaPath)) continue;
      try {
        const job = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Job;
        if (TRANSIENT_STATUSES.includes(job.status)) {
          job.status = "error";
          job.error = "Server wurde neu gestartet während der Verarbeitung";
          fs.writeFileSync(metaPath, JSON.stringify(job, null, 2));
        }
        jobs.set(job.id, job);
      } catch {
        // Skip malformed meta files
      }
    }
    console.log(`JobStore: ${jobs.size} Jobs aus Disk geladen`);
  },

  create(id: string, data: Omit<Job, "id" | "createdAt">): Job {
    const job: Job = { id, createdAt: Date.now(), ...data };
    jobs.set(id, job);
    persist(job);
    return job;
  },

  get(id: string): Job | undefined {
    return jobs.get(id);
  },

  update(id: string, patch: Partial<Job>): Job | undefined {
    const job = jobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...patch };
    jobs.set(id, updated);
    persist(updated);
    return updated;
  },

  list(): Job[] {
    return Array.from(jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  delete(id: string): boolean {
    return jobs.delete(id);
  },
};
