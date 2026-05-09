export interface Word {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
  emoji?: string;
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

export interface CutPoint {
  startMs: number;
  endMs: number;
}

export interface BRollSegment {
  startMs: number;
  endMs: number;
  pexelsQuery?: string;
  userFilePath?: string;
  resolvedVideoUrl?: string;
}

export interface ShortVideoProps {
  videoSrc: string;
  captions: { text: string; words: Word[] };
  silenceSegments: CutPoint[];
  brollSegments: BRollSegment[];
  captionStyle: CaptionStyle;
  durationMs: number;
}
