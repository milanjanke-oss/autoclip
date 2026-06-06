import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { UPLOADS_DIR } from "../config";
import type { BRollSegment, CaptionStyle, CutPoint, Word } from "./jobStore";

const REMOTION_ROOT =
  process.env.REMOTION_ENTRY || path.join(__dirname, "../../../remotion/src/index.ts");
const BACKEND_PORT = process.env.PORT || 4000;

export interface RenderInput {
  videoPath: string;
  captions: { text: string; words: Word[] };
  silenceSegments: CutPoint[];
  durationMs: number;
  brollSegments: BRollSegment[];
  captionStyle: CaptionStyle;
  outputPath: string;
}

function getSpeakingDurationMs(durationMs: number, silenceSegments: CutPoint[]): number {
  if (silenceSegments.length === 0) return durationMs;
  let cursor = 0;
  let speakingMs = 0;
  for (const silence of silenceSegments) {
    if (silence.startMs > cursor) speakingMs += silence.startMs - cursor;
    cursor = silence.endMs;
  }
  if (cursor < durationMs) speakingMs += durationMs - cursor;
  return speakingMs;
}

export async function renderShortVideo(input: RenderInput): Promise<void> {
  const relPath = path.relative(UPLOADS_DIR, input.videoPath).replace(/\\/g, "/");
  // Chromium lädt das Video vom selben Server. 127.0.0.1 statt localhost (vermeidet IPv6-Probleme);
  // per INTERNAL_BASE_URL überschreibbar, falls Rendering später ausgelagert wird.
  const internalBase = process.env.INTERNAL_BASE_URL || `http://127.0.0.1:${BACKEND_PORT}`;
  const videoSrc = `${internalBase}/uploads/${relPath}`;

  const outputDurationMs = getSpeakingDurationMs(input.durationMs, input.silenceSegments);

  const bundled = await bundle({
    entryPoint: REMOTION_ROOT,
    webpackOverride: (config) => config,
  });

  const fps = 30;
  const durationFrames = Math.max(1, Math.ceil((outputDurationMs / 1000) * fps));

  const inputProps = {
    videoSrc,
    captions: input.captions,
    silenceSegments: input.silenceSegments,
    brollSegments: input.brollSegments,
    captionStyle: input.captionStyle,
    durationMs: input.durationMs,
  };

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "ShortVideo",
    inputProps,
  });

  await renderMedia({
    composition: { ...composition, durationInFrames: durationFrames },
    serveUrl: bundled,
    codec: "h264",
    outputLocation: input.outputPath,
    inputProps,
    concurrency: 1,
    chromiumOptions: { gl: "swiftshader" },
  });
}
