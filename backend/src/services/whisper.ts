import fs from "fs";
import OpenAI from "openai";
import type { Word } from "./jobStore";
import { getEmojiForWord } from "./emojiMapper";

// Groq ist OpenAI-kompatibel — kein extra Paket nötig
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function transcribeVideo(
  videoPath: string,
  language: "de" | "en"
): Promise<{ text: string; words: Word[] }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY fehlt — bitte in .env eintragen (kostenlos auf console.groq.com)");
  }

  const file = fs.createReadStream(videoPath);

  let response;
  try {
    response = await client.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Groq Whisper Fehler: ${msg}`);
  }

  const words: Word[] = (response.words ?? []).map((w) => ({
    text: w.word.trim(),
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
    timestampMs: Math.round(w.start * 1000),
    confidence: null,
    emoji: getEmojiForWord(w.word),
  }));

  return { text: response.text, words };
}
