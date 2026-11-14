import { useCurrentFrame } from "remotion";
import { useRef, useEffect } from "react";
import type { Stroke } from "../types/Scene";

interface StrokePathProps {
  stroke: Stroke;
  /**
   * Ref that will be populated with the SVGPathElement after mount.
   * Parent can call getTotalLength / getPointAtLength on it synchronously
   * during the same render cycle (Remotion renders in Chromium — DOM is live).
   */
  pathRef?: React.RefObject<SVGPathElement>;
}

export const StrokePath: React.FC<StrokePathProps> = ({ stroke, pathRef }) => {
  const frame = useCurrentFrame();
  const internalRef = useRef<SVGPathElement>(null);
  const ref = pathRef ?? internalRef;

  const { startFrame, durationFrames } = stroke;
  const rawProgress = (frame - startFrame) / durationFrames;
  const progress = Math.min(1, Math.max(0, rawProgress));

  const isBeforeStart = frame < startFrame;
  const isFinished = frame > startFrame + durationFrames;

  // pathLength is read synchronously from the DOM element.
  // In Remotion's Chromium renderer the element is already in the DOM
  // when the component body runs on subsequent frames.
  // On the very first render the ref may be null — dashoffset defaults to full.
  const pathLength = ref.current?.getTotalLength() ?? 0;

  const dashOffset = isBeforeStart
    ? pathLength          // fully hidden
    : isFinished
    ? 0                   // fully drawn
    : pathLength * (1 - progress);

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
