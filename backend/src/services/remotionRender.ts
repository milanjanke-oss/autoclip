import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import type { BRollSegment, CaptionStyle, CutPoint, Word } from "./jobStore";

const REMOTION_ROOT = path.join(__dirname, "../../../remotion/src/index.ts");

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
  const videoSrc = input.videoPath.startsWith("file://")
    ? input.videoPath
    : `file://${input.videoPath}`;

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
  });
}
