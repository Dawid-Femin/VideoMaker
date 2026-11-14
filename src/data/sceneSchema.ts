import { z } from "zod";

export const StrokeSchema = z.object({
  id: z.string(),
  d: z.string(),
  /**
   * Frame at which drawing starts.
   * Optional — if omitted, buildTimeline calculates it automatically
   * based on the previous stroke's end + delayFrames.
   */
  startFrame: z.number().int().nonnegative().optional(),
  /**
   * Frames to wait after the previous stroke finishes before this one starts.
   * Only used when startFrame is omitted. Defaults to 0.
   */
  delayFrames: z.number().int().nonnegative().optional().default(0),
  durationFrames: z.number().int().positive(),
  strokeColor: z.string(),
  strokeWidth: z.number().positive(),
  fillColor: z.string(),
  easing: z
    .enum([
      "linear",
      "easeIn",
      "easeOut",
      "easeInOut",
      "easeInCubic",
      "easeOutCubic",
      "easeInOutCubic",
    ])
    .optional()
    .default("linear"),
});

export const HandSchema = z.object({
  imageSrc: z.string(),
  penOffsetX: z.number(),
  penOffsetY: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  betweenStrokes: z.enum(["hide", "freeze"]).optional().default("hide"),
});

export const SceneSchema = z.object({
  fps: z.number().int().positive(),
  durationInSeconds: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  background: z.string(),
  audioSrc: z.string().optional(),
  strokes: z.array(StrokeSchema).min(1),
  hand: HandSchema.optional(),
});

export type SceneInput = z.input<typeof SceneSchema>;
