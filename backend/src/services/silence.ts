import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";
import type { CutPoint } from "./jobStore";

if (ffmpegPath) Ffmpeg.setFfmpegPath(ffmpegPath);

interface SilenceAnalysis {
  silenceSegments: CutPoint[];
  durationMs: number;
}

export async function analyzeSilence(
  videoPath: string,
  noiseDb = -40,
  minDurationSec = 0.5
): Promise<SilenceAnalysis> {
  return new Promise((resolve, reject) => {
    const silenceSegments: CutPoint[] = [];
    let durationMs = 0;
    let pendingStart: number | null = null;

    Ffmpeg(videoPath)
      .audioFilters(`silencedetect=noise=${noiseDb}dB:duration=${minDurationSec}`)
      .format("null")
      .output("-")
      .on("stderr", (line: string) => {
        const durationMatch = line.match(/Duration:\s+(\d+):(\d+):(\d+\.\d+)/);
        if (durationMatch) {
          const h = parseInt(durationMatch[1]);
          const m = parseInt(durationMatch[2]);
          const s = parseFloat(durationMatch[3]);
          durationMs = (h * 3600 + m * 60 + s) * 1000;
        }

        const startMatch = line.match(/silence_start:\s*([\d.]+)/);
        if (startMatch) {
          pendingStart = parseFloat(startMatch[1]) * 1000;
        }

        const endMatch = line.match(/silence_end:\s*([\d.]+)/);
        if (endMatch && pendingStart !== null) {
          silenceSegments.push({
            startMs: pendingStart,
            endMs: parseFloat(endMatch[1]) * 1000,
          });
          pendingStart = null;
        }
      })
      .on("end", () => resolve({ silenceSegments, durationMs }))
      .on("error", reject)
      .run();
  });
}

export function getSpeakingSegments(
  durationMs: number,
  silenceSegments: CutPoint[]
): CutPoint[] {
  const speaking: CutPoint[] = [];
  let cursor = 0;

  for (const silence of silenceSegments) {
    if (silence.startMs > cursor) {
      speaking.push({ startMs: cursor, endMs: silence.startMs });
    }
    cursor = silence.endMs;
  }

  if (cursor < durationMs) {
    speaking.push({ startMs: cursor, endMs: durationMs });
  }

  return speaking;
}
