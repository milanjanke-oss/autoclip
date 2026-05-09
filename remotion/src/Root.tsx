import React from "react";
import { Composition } from "remotion";
import { ShortVideo } from "./ShortVideo";

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
  },
  durationMs: 60000,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortVideo"
      component={ShortVideo}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_PROPS}
    />
  );
};
