import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useState, useCallback } from "react";
import { StrokePath } from "./StrokePath";
import { Hand } from "./Hand";
import type { Scene } from "../types/Scene";

interface WhiteboardSceneProps {
  scene: Scene;
}

export const WhiteboardScene: React.FC<WhiteboardSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const [penTip, setPenTip] = useState<DOMPoint | null>(null);

  // Determine which stroke is currently being drawn
  const activeStroke = scene.strokes.find(
    (s) => frame >= s.startFrame && frame <= s.startFrame + s.durationFrames
  ) ?? null;

  const handleProgress = useCallback(
    (_progress: number, point: DOMPoint) => {
      setPenTip(point);
    },
    []
  );

  return (
    <AbsoluteFill style={{ background: scene.background }}>
      {/* SVG layer — all strokes */}
      <svg
        width={scene.width}
        height={scene.height}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {scene.strokes.map((stroke) => (
          <StrokePath
            key={stroke.id}
            stroke={stroke}
            onProgress={
              activeStroke?.id === stroke.id ? handleProgress : undefined
            }
          />
        ))}
      </svg>

      {/* Hand layer — absolutely positioned on top of SVG */}
      {scene.hand && (
        <Hand
          config={scene.hand}
          penTip={penTip}
          visible={activeStroke !== null}
        />
      )}
    </AbsoluteFill>
  );
};
