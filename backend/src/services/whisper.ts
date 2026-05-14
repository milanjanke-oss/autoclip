import fs from "fs";
import os from "os";
import path from "path";
import OpenAI from "openai";
import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";
import type { Word } from "./jobStore";
import { getEmojiForWord } from "./emojiMapper";

if (ffmpegPath) Ffmpeg.setFfmpegPath(ffmpegPath);

const MAX_GROQ_BYTES = 24 * 1024 * 1024; // 24 MB
const CHUNK_SECONDS = 600; // 10 Minuten pro Chunk

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

function extractAudio(videoPath: string, startSec = 0, durationSec?: number): Promise<string> {
  const suffix = startSec > 0 ? `_${startSec}` : "";
  const outPath = path.join(os.tmpdir(), `ac_audio_${Date.now()}${suffix}.mp3`);
  return new Promise((resolve, reject) => {
    let cmd = Ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("16k")
      .audioChannels(1)
      .audioFrequency(16000);
    if (startSec > 0) cmd = cmd.seekInput(startSec);
    if (durationSec != null) cmd = cmd.duration(durationSec);
    cmd
      .output(outPath)
      .on("end", () => resolve(outPath))
      .on("error", reject)
      .run();
  });
}

function getVideoDurationSec(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(videoPath, (err, meta) => {
      if (err) reject(err);
      else resolve(meta.format.duration ?? 0);
    });
  });
}

async function transcribeAudioFile(
  audioPath: string,
  language: "de" | "en",
  offsetSec = 0
): Promise<Word[]> {
  const response = await getClient().audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-large-v3-turbo",
    language,
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  return (response.words ?? []).map((w) => ({
    text: w.word.trim(),
    startMs: Math.round((w.start + offsetSec) * 1000),
    endMs: Math.round((w.end + offsetSec) * 1000),
    timestampMs: Math.round((w.start + offsetSec) * 1000),
    confidence: null,
    emoji: getEmojiForWord(w.word),
  }));
}

export async function transcribeVideo(
  videoPath: string,
  language: "de" | "en"
): Promise<{ text: string; words: Word[] }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY fehlt — bitte in .env eintragen (kostenlos auf console.groq.com)");
  }

  const audioPath = await extractAudio(videoPath);
  const audioSize = fs.statSync(audioPath).size;

  let allWords: Word[];

  if (audioSize <= MAX_GROQ_BYTES) {
    try {
      allWords = await transcribeAudioFile(audioPath, language);
    } catch (err: unknown) {
      fs.unlink(audioPath, () => {});
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Groq Whisper Fehler: ${msg}`);
    }
    fs.unlink(audioPath, () => {});
  } else {
    // Audio zu groß → in Chunks aufteilen
    fs.unlink(audioPath, () => {});
    const totalSec = await getVideoDurationSec(videoPath);
    allWords = [];
    const chunkPaths: string[] = [];

    try {
      for (let start = 0; start < totalSec; start += CHUNK_SECONDS) {
        const dur = Math.min(CHUNK_SECONDS, totalSec - start);
        const chunkPath = await extractAudio(videoPath, start, dur);
        chunkPaths.push(chunkPath);
        const words = await transcribeAudioFile(chunkPath, language, start);
        allWords.push(...words);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Groq Whisper Fehler: ${msg}`);
    } finally {
      chunkPaths.forEach((p) => fs.unlink(p, () => {}));
    }
  }

  const text = allWords.map((w) => w.text).join(" ");
  return { text, words: allWords };
}
