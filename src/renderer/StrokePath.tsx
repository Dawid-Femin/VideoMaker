import { useCurrentFrame } from "remotion";
import { useRef } from "react";
import type { Stroke } from "../types/Scene";
import { applyEasing } from "../utils/easing";

interface StrokePathProps {
  stroke: Stroke;
  /**
   * Ref populated with the SVGPathElement after mount.
   * Parent reads getTotalLength / getPointAtLength synchronously.
   */
  pathRef?: React.RefObject<SVGPathElement>;
}

export const StrokePath: React.FC<StrokePathProps> = ({ stroke, pathRef }) => {
  const frame = useCurrentFrame();
  const internalRef = useRef<SVGPathElement>(null);
  const ref = pathRef ?? internalRef;

  const { startFrame, durationFrames, easing = "linear" } = stroke;

  const rawProgress = (frame - startFrame) / durationFrames;
  const clampedProgress = Math.min(1, Math.max(0, rawProgress));
  // Apply easing to the clamped linear progress
  const easedProgress = applyEasing(clampedProgress, easing);

  const isBeforeStart = frame < startFrame;
  const isFinished = frame > startFrame + durationFrames;

  const pathLength = ref.current?.getTotalLength() ?? 0;

  const dashOffset = isBeforeStart
    ? pathLength       // fully hidden
    : isFinished
    ? 0                // fully drawn
    : pathLength * (1 - easedProgress);

  return (
    <path
      ref={ref}
      d={stroke.d}
      stroke={stroke.strokeColor}
      strokeWidth={stroke.strokeWidth}
      fill={stroke.fillColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength || undefined}
      strokeDashoffset={pathLength ? dashOffset : undefined}
    />
  );
};
