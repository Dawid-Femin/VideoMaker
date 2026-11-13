import { useCurrentFrame } from "remotion";
import { useRef, useEffect, useState } from "react";
import type { Stroke } from "../types/Scene";

interface StrokePathProps {
  stroke: Stroke;
  /** Callback fired every frame with current progress (0–1) and point on path */
  onProgress?: (progress: number, point: DOMPoint) => void;
}

export const StrokePath: React.FC<StrokePathProps> = ({ stroke, onProgress }) => {
  const frame = useCurrentFrame();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);

  // Measure path length once after mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [stroke.d]);

  const { startFrame, durationFrames } = stroke;
  const rawProgress = (frame - startFrame) / durationFrames;
  const progress = Math.min(1, Math.max(0, rawProgress));

  // Notify parent about current pen position
  useEffect(() => {
    if (pathRef.current && pathLength !== null && onProgress) {
      const point = pathRef.current.getPointAtLength(progress * pathLength);
      onProgress(progress, point);
    }
  });

  if (pathLength === null) {
    // First render: render invisible path so getTotalLength() can be called
    return (
      <path
        ref={pathRef}
        d={stroke.d}
        stroke="none"
        fill="none"
      />
    );
  }

  const isActive = frame >= startFrame && frame <= startFrame + durationFrames;
  const isFinished = frame > startFrame + durationFrames;

  return (
    <path
      ref={pathRef}
      d={stroke.d}
      stroke={stroke.strokeColor}
      strokeWidth={stroke.strokeWidth}
      fill={stroke.fillColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      strokeDashoffset={
        isFinished
          ? 0
          : isActive
          ? pathLength * (1 - progress)
          : pathLength
      }
    />
  );
};
