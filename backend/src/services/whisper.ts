import fs from "fs";
import OpenAI from "openai";
import type { Word } from "./jobStore";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeVideo(
  videoPath: string,
  language: "de" | "en"
): Promise<{ text: string; words: Word[] }> {
  const file = fs.createReadStream(videoPath);

  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language,
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  const words: Word[] = (response.words ?? []).map((w) => ({
    text: w.word.trim(),
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
    timestampMs: Math.round(w.start * 1000),
    confidence: null,
  }));

  return { text: response.text, words };
}
