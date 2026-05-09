import React, { useRef, useState } from "react";

interface Props {
  src: string;
  onTimeUpdate?: (currentSec: number) => void;
}

export const VideoPreview: React.FC<Props> = ({ src, onTimeUpdate }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTimeUpdate = () => {
    if (ref.current && onTimeUpdate) {
      onTimeUpdate(ref.current.currentTime);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {isExpanded ? "▲ Video ausblenden" : "▼ Originalvideo anzeigen"}
      </button>

      {isExpanded && (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 max-h-[40vh]">
          <video
            ref={ref}
            src={src}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="w-full max-h-[40vh] object-contain"
            style={{ display: "block" }}
          />
        </div>
      )}
    </div>
  );
};
