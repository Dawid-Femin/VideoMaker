import { SceneSchema } from "./sceneSchema";
import { buildTimeline } from "../utils/buildTimeline";
import type { Scene } from "../types/Scene";

/**
 * Loads and validates a scene.json file, then builds the timeline.
 *
 * - Validates the raw JSON against SceneSchema (throws on invalid input).
 * - Runs buildTimeline to fill in missing startFrame values based on
 *   the previous stroke's end + delayFrames.
 *
 * Usage:
 *   import sceneData from "../../scene-data/scene.json";
 *   const scene = loadScene(sceneData);
 */
export function loadScene(raw: unknown): Scene {
  const result = SceneSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `  [${e.path.join(".")}] ${e.message}`)
      .join("\n");
    throw new Error(`Invalid scene.json:\n${messages}`);
  }

  const data = result.data;

  return {
    ...data,
    strokes: buildTimeline(data.strokes),
  };
}
