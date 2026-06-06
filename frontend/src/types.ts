export interface Word {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
  emoji?: string;
}

export type CaptionVariant = "classic" | "box" | "outline" | "minimal" | "neon";

export type HighlightMode = "color" | "outline";

export interface CaptionStyle {
  color: string;
  highlightColor: string;
  fontSize: number;
  position: "bottom" | "middle" | "top";
  wordsPerChunk: number;
  variant: CaptionVariant;
  fontFamily?: string;
  highlightMode?: HighlightMode;
  strokeColor?: string;
  strokeWidth?: number;
}
