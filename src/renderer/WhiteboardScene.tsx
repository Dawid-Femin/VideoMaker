import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from "remotion";
import { useRef } from "react";
import { StrokePath } from "./StrokePath";
import { Hand } from "./Hand";
import type { Scene, Stroke } from "../types/Scene";
import { applyEasing } from "../utils/easing";

interface WhiteboardSceneProps {
  scene: Scene;
}

/** Returns the pen tip point for a given stroke at the given frame, with easing applied. */
function getPenTip(
  el: SVGPathElement,
  stroke: Stroke,
  frame: number
): DOMPoint {
  const totalLength = el.getTotalLength();
  const rawProgress = Math.min(
    1,
    Math.max(0, (frame - stroke.startFrame) / stroke.durationFrames)
  );
  const easedProgress = applyEasing(rawProgress, stroke.easing ?? "linear");
  return el.getPointAtLength(easedProgress * totalLength);
}

export const WhiteboardScene: React.FC<WhiteboardSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();

  // Stable map of refs — one per stroke id
  const pathRefs = useRef<Map<string, React.RefObject<SVGPathElement>>>(
    new Map()
  );
  scene.strokes.forEach((s) => {
    if (!pathRefs.current.has(s.id)) {
      pathRefs.current.set(s.id, { current: null });
    }
  });

  // Strokes sorted by startFrame (scene.json should already be ordered,
  // but we sort defensively so edge-case logic is correct)
  const sortedStrokes = [...scene.strokes].sort(
    (a, b) => a.startFrame - b.startFrame
  );

  // Which stroke is actively being drawn right now?
  const activeStroke =
    sortedStrokes.find(
      (s) => frame >= s.startFrame && frame <= s.startFrame + s.durationFrames
    ) ?? null;

  // Last stroke that has already finished (for "freeze" mode)
  const lastFinishedStroke =
    [...sortedStrokes]
      .reverse()
      .find((s) => frame > s.startFrame + s.durationFrames) ?? null;

  // --- Pen tip & visibility logic ---
  const betweenStrokes = scene.hand?.betweenStrokes ?? "hide";
  const firstStrokeStart = sortedStrokes[0]?.startFrame ?? 0;
  const lastStrokeEnd =
    (sortedStrokes[sortedStrokes.length - 1]?.startFrame ?? 0) +
    (sortedStrokes[sortedStrokes.length - 1]?.durationFrames ?? 0);

  const isBeforeAnyStroke = frame < firstStrokeStart;
  const isAfterAllStrokes = frame > lastStrokeEnd;
  const isBetweenStrokes = !activeStroke && !isBeforeAnyStroke && !isAfterAllStrokes;

  let penTip: DOMPoint | null = null;
  let handVisible = false;

  if (activeStroke) {
    const el = pathRefs.current.get(activeStroke.id)?.current;
    if (el) {
      penTip = getPenTip(el, activeStroke, frame);
      handVisible = true;
    }
  } else if (isBetweenStrokes && betweenStrokes === "freeze" && lastFinishedStroke) {
    const el = pathRefs.current.get(lastFinishedStroke.id)?.current;
    if (el) {
      // Freeze at the fully-drawn end point (progress = 1, easing doesn't matter)
      penTip = getPenTip(
        el,
        lastFinishedStroke,
        lastFinishedStroke.startFrame + lastFinishedStroke.durationFrames
      );
      handVisible = true;
    }
  }
  // isBeforeAnyStroke, isAfterAllStrokes, or hide mode → handVisible stays false

  return (
    <AbsoluteFill style={{ background: scene.background }}>
      {/* Audio — only if audioSrc is defined in scene.json */}
      {scene.audioSrc && <Audio src={staticFile(scene.audioSrc)} />}

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

      {/* Hand layer */}
      {scene.hand && (
        <Hand
          config={{
            ...scene.hand,
            imageSrc: staticFile(scene.hand.imageSrc),
          }}
          penTip={penTip}
          visible={handVisible}
        />
      )}
    </AbsoluteFill>
  );
};
