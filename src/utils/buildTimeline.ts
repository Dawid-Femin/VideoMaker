import type { Stroke } from "../types/Scene";

export interface StrokeInput extends Omit<Stroke, "startFrame"> {
  /** Frames to wait after the previous stroke finishes. Defaults to 0. */
  delayFrames?: number;
  /** Override automatic startFrame — if set, sequencing continues from here. */
  startFrame?: number;
}

/**
 * Assigns startFrame to each stroke automatically in sequence:
 *
 *   stroke[n].startFrame = stroke[n-1].startFrame
 *                        + stroke[n-1].durationFrames
 *                        + stroke[n].delayFrames
 *
 * If a stroke already has an explicit startFrame it is used as-is
 * and the cursor jumps to that position.
 *
 * Example scene.json strokes (no startFrame needed):
 *   { id: "s1", durationFrames: 60, delayFrames: 10, ... }  → startFrame: 10
 *   { id: "s2", durationFrames: 60, delayFrames: 20, ... }  → startFrame: 90
 *   { id: "s3", durationFrames: 60, delayFrames: 0,  ... }  → startFrame: 170
 */
export function buildTimeline(strokes: StrokeInput[]): Stroke[] {
  let cursor = 0;
  return strokes.map((s) => {
    const startFrame = s.startFrame ?? cursor + (s.delayFrames ?? 0);
    cursor = startFrame + s.durationFrames;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { delayFrames: _d, ...rest } = s;
    return { ...rest, startFrame };
  });
}
