import type { Scene } from "../types/Scene";

/** Hardcoded sample scene used in T1 — no JSON loading yet */
export const sampleScene: Scene = {
  fps: 30,
  durationInSeconds: 5,
  width: 1920,
  height: 1080,
  background: "#ffffff",
  strokes: [
    {
      id: "stroke-1",
      d: "M 200 540 C 400 200 800 200 960 540 C 1120 880 1520 880 1720 540",
      startFrame: 10,
      durationFrames: 100,
      strokeColor: "#1a1a1a",
      strokeWidth: 6,
      fillColor: "none",
    },
  ],
  hand: {
    imageSrc: "hand.png",
    // Original image: 1388×989px, pen tip at x=0, y=270
    // Displayed at 50% scale (694×494), so offset scales proportionally
    penOffsetX: 0,
    penOffsetY: 135,
    width: 694,
    height: 494,
  },
};
