import fs from "fs";
import path from "path";
import { rm } from "fs/promises";
import { UPLOADS_DIR } from "../config";
import { jobStore } from "./jobStore";

const TTL_HOURS = Number(process.env.UPLOAD_TTL_HOURS || 24);

// Löscht Job-Ordner, die älter als TTL_HOURS sind (Schutz vor voller Disk).
export async function cleanupOldUploads(): Promise<void> {
  const cutoff = Date.now() - TTL_HOURS * 60 * 60 * 1000;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(UPLOADS_DIR, entry.name);
    const job = jobStore.get(entry.name);
    let ageRef: number;
    try {
      ageRef = job?.createdAt ?? fs.statSync(dir).mtimeMs;
    } catch {
      continue;
    }
    if (ageRef < cutoff) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
      jobStore.delete(entry.name);
      console.log(`Cleanup: Job ${entry.name} (älter als ${TTL_HOURS}h) gelöscht`);
    }
  }
}

export function startCleanupSchedule(): void {
  cleanupOldUploads();
  setInterval(cleanupOldUploads, 60 * 60 * 1000); // stündlich
}
