import React from "react";
import { Composition } from "remotion";
import { BRollMotion } from "./compositions/broll/BRollMotion";
import { BRollPexels } from "./compositions/broll/BRollPexels";
import { BRollQuestion } from "./compositions/broll/BRollQuestion";
import { BRollScreen } from "./compositions/broll/BRollScreen";
import { BRollTextStats } from "./compositions/broll/BRollTextStats";
import { VideoHookFrame } from "./compositions/VideoHookFrame";
import { VideoPortraitFrame } from "./compositions/VideoPortraitFrame";
import { ShortVideo } from "./ShortVideo";
import { CaptionPreview } from "./CaptionPreview";

const DEFAULT_PROPS = {
  videoSrc: "",
  captions: { text: "", words: [] },
  silenceSegments: [],
  brollSegments: [],
  captionStyle: {
    color: "#ffffff",
    highlightColor: "#FFE600",
    fontSize: 78,
    position: "bottom" as const,
    wordsPerChunk: 3,
    variant: "classic" as const,
    fontFamily: "Montserrat",
    highlightMode: "color" as const,
    strokeColor: "#000000",
    strokeWidth: 3,
  },
  durationMs: 60000,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortVideo"
        component={ShortVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_PROPS}
      />

      {/* ── Stil-Vorschau (nur Untertitel, kein Video) ── */}
      <Composition
        id="CaptionPreview"
        component={CaptionPreview}
        durationInFrames={72}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          captionStyle: {
            color: "#ffffff",
            highlightColor: "#FFE600",
            fontSize: 96,
            position: "middle" as const,
            wordsPerChunk: 3,
            variant: "classic" as const,
            fontFamily: "Montserrat",
            highlightMode: "color" as const,
            strokeColor: "#000000",
            strokeWidth: 3,
          },
        }}
      />

      {/* ── B-Roll Kompositionen ── */}
      <Composition
        id="BRollTextStats"
        component={BRollTextStats}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "KI spart Zeit",
          bullets: ["Kein manuelles Tippen", "Automatische Zusammenfassung", "Sofort einsatzbereit"],
          stat: { value: 80, label: "Zeitersparnis pro Woche", suffix: "%" },
          variant: "dark" as const,
          durationMs: 4000,
        }}
      />

      <Composition
        id="BRollPexels"
        component={BRollPexels}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoUrl: "",
          overlayText: "So arbeiten Unternehmer 2025",
          overlayPosition: "bottom" as const,
          durationMs: 5000,
        }}
      />

      <Composition
        id="BRollScreen"
        component={BRollScreen}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          screenSrc: "",
          label: "Live Demo",
          durationMs: 6000,
        }}
      />

      <Composition
        id="BRollMotion"
        component={BRollMotion}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          variant: "before-after" as const,
          before: "2 Stunden E-Mails schreiben",
          after: "3 Minuten mit KI-Agent",
          durationMs: 5000,
        }}
      />

      <Composition
        id="BRollQuestion"
        component={BRollQuestion}
        durationInFrames={105}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          question: "Wie fange ich mit KI an?",
          asker: "max_muster",
          durationMs: 3500,
        }}
      />

      <Composition
        id="VideoHookFrame"
        component={VideoHookFrame}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: "",
          line1: "FÜR",
          line2: "CLAUDE",
          line3: "die du kennen musst",
          bgColor: "#C4714A",
          accentColor: "#4DD9D9",
          durationMs: 30000,
        }}
      />
      <Composition
        id="VideoPortraitFrame"
        component={VideoPortraitFrame}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          personVideoSrc: "",
          line1: "FÜR",
          line2: "CLAUDE",
          line3: "die du kennen musst",
          bgColor: "#C4714A",
          accentColor: "#4DD9D9",
          logoColor: "#ffffff",
          durationMs: 30000,
          backgroundIcon: "claude",
        }}
      />
    </>
  );
};
