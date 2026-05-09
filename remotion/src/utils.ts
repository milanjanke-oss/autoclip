export interface CutPoint {
  startMs: number;
  endMs: number;
}

export function getSpeakingSegments(durationMs: number, silenceSegments: CutPoint[]): CutPoint[] {
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

export function remapTimestamp(originalMs: number, speakingSegments: CutPoint[]): number {
  let offset = 0;
  for (const seg of speakingSegments) {
    if (originalMs <= seg.endMs) {
      if (originalMs >= seg.startMs) {
        return offset + (originalMs - seg.startMs);
      }
      return offset;
    }
    offset += seg.endMs - seg.startMs;
  }
  return offset;
}
