import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from "remotion";
import { useRef } from "react";
import { StrokePath } from "./StrokePath";
import { Hand } from "./Hand";
import type { Scene } from "../types/Scene";

interface WhiteboardSceneProps {
  scene: Scene;
}

export const WhiteboardScene: React.FC<WhiteboardSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();

  // One ref per stroke — hooks must not be called conditionally,
  // so we keep a stable map via a plain object keyed by stroke id.
  // We use a single ref to a Map to avoid creating new refs on every render.
  const pathRefs = useRef<Map<string, React.RefObject<SVGPathElement>>>(
    new Map()
  );

  // Ensure every stroke has a ref entry (safe to call each render — Map is stable)
  scene.strokes.forEach((s) => {
    if (!pathRefs.current.has(s.id)) {
      pathRefs.current.set(s.id, { current: null });
    }
  });

  // Determine which stroke is currently being drawn
  const activeStroke =
    scene.strokes.find(
      (s) => frame >= s.startFrame && frame <= s.startFrame + s.durationFrames
    ) ?? null;

  // Calculate pen tip synchronously from the DOM element (Chromium — DOM is live)
  let penTip: DOMPoint | null = null;
  if (activeStroke) {
    const ref = pathRefs.current.get(activeStroke.id);
    const el = ref?.current;
    if (el) {
      const totalLength = el.getTotalLength();
      const progress = Math.min(
        1,
        Math.max(
          0,
          (frame - activeStroke.startFrame) / activeStroke.durationFrames
        )
      );
      penTip = el.getPointAtLength(progress * totalLength);
    }
  }

  return (
    <AbsoluteFill style={{ background: scene.background }}>
      {/* Audio — only if audioSrc is defined in scene.json */}
      {scene.audioSrc && (
        <Audio src={staticFile(scene.audioSrc)} />
      )}
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
            pathRef={pathRefs.current.get(stroke.id)}
          />
        ))}
      </svg>

      {/* Hand layer — absolutely positioned on top of SVG */}
      {scene.hand && (
        <Hand
          config={{
            ...scene.hand,
            imageSrc: staticFile(scene.hand.imageSrc),
          }}
          penTip={penTip}
          visible={activeStroke !== null}
        />
      )}
    </AbsoluteFill>
  );
};
