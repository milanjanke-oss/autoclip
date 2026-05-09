import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, useVideoConfig } from "remotion";
import { BRollOverlay } from "./BRollOverlay";
import { Caption } from "./Caption";
import { EmojiOverlay } from "./EmojiOverlay";
import type { ShortVideoProps, Word } from "./types";
import { getSpeakingSegments, remapTimestamp } from "./utils";

export const ShortVideo: React.FC<ShortVideoProps> = ({
  videoSrc,
  captions,
  silenceSegments,
  brollSegments,
  captionStyle,
  durationMs,
}) => {
  const { fps, width, height } = useVideoConfig();

  const speakingSegments =
    silenceSegments.length > 0
      ? getSpeakingSegments(durationMs, silenceSegments)
      : [{ startMs: 0, endMs: durationMs }];

  const remappedWords: Word[] = captions.words.map((w) => ({
    ...w,
    startMs: remapTimestamp(w.startMs, speakingSegments),
    endMs: remapTimestamp(w.endMs, speakingSegments),
    timestampMs: remapTimestamp(w.timestampMs, speakingSegments),
  }));

  let frameOffset = 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", width, height }}>
      {speakingSegments.map((seg, i) => {
        const startFrame = Math.round((seg.startMs / 1000) * fps);
        const durationFrames = Math.max(1, Math.round(((seg.endMs - seg.startMs) / 1000) * fps));
        const currentOffset = frameOffset;
        frameOffset += durationFrames;

        return (
          <Sequence key={i} from={currentOffset} durationInFrames={durationFrames}>
            <AbsoluteFill>
              <OffthreadVideo
                src={videoSrc}
                startFrom={startFrame}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      <BRollOverlay segments={brollSegments} />

      <Caption words={remappedWords} style={captionStyle} />
      <EmojiOverlay words={remappedWords} />
    </AbsoluteFill>
  );
};
