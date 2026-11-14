import { SceneSchema } from "./sceneSchema";
import type { Scene } from "../types/Scene";

/**
 * Loads and validates a scene.json file.
 *
 * Usage (in Root.tsx or any module-level import):
 *   import sceneData from "../../scene-data/scene.json";
 *   const scene = loadScene(sceneData);
 *
 * Throws a descriptive error if the JSON does not match the expected schema.
 */
export function loadScene(raw: unknown): Scene {
  const result = SceneSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `  [${e.path.join(".")}] ${e.message}`)
      .join("\n");
    throw new Error(`Invalid scene.json:\n${messages}`);
  }

  return result.data;
}
