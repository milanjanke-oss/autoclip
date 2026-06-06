import { authHeaders, handleUnauthorized } from "./auth";

const BASE = (import.meta.env.VITE_BACKEND_URL as string) || "";

export async function uploadVideo(
  file: File,
  language: "de" | "en",
  onProgress?: (pct: number) => void
): Promise<{ jobId: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("video", file);
    form.append("language", language);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);
    const code = authHeaders()["X-Access-Code"];
    if (code) xhr.setRequestHeader("X-Access-Code", code);
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else if (xhr.status === 401) { handleUnauthorized(); reject(new Error("Zugangscode ungültig")); }
      else {
        let detail = "";
        try { detail = ` (${JSON.parse(xhr.responseText).error})`; } catch {}
        reject(new Error(`Upload fehlgeschlagen${detail} [${xhr.status}]`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload fehlgeschlagen – Backend nicht erreichbar"));
    xhr.send(form);
  });
}

export async function analyzeJob(
  jobId: string,
  opts?: { noiseDb?: number; minDuration?: number }
): Promise<void> {
  const res = await fetch(`${BASE}/analyze/${jobId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(opts ?? {}),
  });
  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("Analyse fehlgeschlagen");
}

export async function getAnalysis(jobId: string): Promise<{
  silenceSegments?: { startMs: number; endMs: number }[];
  durationMs?: number;
}> {
  const res = await fetch(`${BASE}/analyze/${jobId}`);
  if (!res.ok) return {};
  return res.json();
}

export async function transcribeJob(
  jobId: string,
  language: "de" | "en"
): Promise<void> {
  const res = await fetch(`${BASE}/transcribe/${jobId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ language }),
  });
  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("Transkription fehlgeschlagen");
}

export async function getJobStatus(jobId: string): Promise<{
  status: string;
  error?: string;
  language?: "de" | "en";
  videoUrl?: string;
  outputPath?: string;
}> {
  const res = await fetch(`${BASE}/render/${jobId}/status`);
  if (!res.ok) throw new Error("Status nicht abrufbar");
  return res.json();
}

export async function getTranscription(jobId: string): Promise<{
  status: string;
  captions?: { text: string; words: import("../types").Word[] };
  error?: string;
}> {
  const res = await fetch(`${BASE}/transcribe/${jobId}`);
  if (!res.ok) throw new Error("Transkript nicht abrufbar");
  return res.json();
}

export async function renderJob(
  jobId: string,
  captionStyle: unknown,
  brollSegments: unknown[]
): Promise<{ outputPath: string }> {
  const res = await fetch(`${BASE}/render/${jobId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ captionStyle, brollSegments }),
  });
  if (res.status === 401) { handleUnauthorized(); throw new Error("Zugangscode ungültig"); }
  if (!res.ok) throw new Error("Rendering fehlgeschlagen");
  return res.json();
}

export async function searchPexels(
  jobId: string,
  query: string
): Promise<{ url: string; thumbnail: string }[]> {
  const res = await fetch(
    `${BASE}/render/${jobId}/pexels?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export interface JobSummary {
  id: string;
  status: string;
  createdAt: number;
  durationMs?: number;
  error?: string;
}

export async function listJobs(): Promise<JobSummary[]> {
  const res = await fetch(`${BASE}/jobs`);
  if (!res.ok) return [];
  return res.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  const res = await fetch(`${BASE}/jobs/${jobId}`, { method: "DELETE", headers: { ...authHeaders() } });
  if (res.status === 401) handleUnauthorized();
}

export function pollJobStatus(
  jobId: string,
  onStatus: (s: string) => void,
  intervalMs = 2000
): () => void {
  const id = setInterval(async () => {
    try {
      const data = await getJobStatus(jobId);
      onStatus(data.status);
      if (data.status === "done" || data.status === "error") {
        clearInterval(id);
      }
    } catch {
      clearInterval(id);
    }
  }, intervalMs);
  return () => clearInterval(id);
}
