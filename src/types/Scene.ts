export interface Stroke {
  id: string;
  /** SVG path data, e.g. "M 100 200 C 150 100 300 100 350 200" */
  d: string;
  /** Frame at which drawing starts */
  startFrame: number;
  /** Number of frames the stroke takes to fully draw */
  durationFrames: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export interface Hand {
  /** Path to the hand PNG image (relative to public/ or absolute URL) */
  imageSrc: string;
  /** X offset in pixels from the top-left of the image to the pen tip */
  penOffsetX: number;
  /** Y offset in pixels from the top-left of the image to the pen tip */
  penOffsetY: number;
  width: number;
  height: number;
}

export interface Scene {
  fps: number;
  durationInSeconds: number;
  width: number;
  height: number;
  background: string;
  audioSrc?: string;
  strokes: Stroke[];
  hand?: Hand;
}
