import type { Stroke } from "../types/Scene";

interface StrokeInput extends Omit<Stroke, "startFrame"> {
  /** Frames to wait after the previous stroke finishes. Defaults to 0. */
  delayFrames?: number;
  /** Override automatic startFrame — if set, disables auto-sequencing for this stroke. */
  startFrame?: number;
}

/**
 * Takes an array of strokes without explicit startFrame values and
 * assigns them automatically in sequence:
 *
 *   stroke[n].startFrame = stroke[n-1].startFrame
 *                        + stroke[n-1].durationFrames
 *                        + stroke[n].delayFrames
 *
 * If a stroke already has an explicit startFrame it is used as-is
 * and sequencing continues from there.
 */
export function buildTimeline(strokes: StrokeInput[]): Stroke[] {
  let cursor = 0;
  return strokes.map((s) => {
    const startFrame = s.startFrame ?? cursor + (s.delayFrames ?? 0);
    cursor = startFrame + s.durationFrames;
    const { delayFrames: _d, ...rest } = s;
    return { ...rest, startFrame };
  });
}
