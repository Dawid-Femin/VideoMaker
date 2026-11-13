import type { Hand as HandConfig } from "../types/Scene";

interface HandProps {
  config: HandConfig;
  /** Current position of the pen tip in SVG coordinates */
  penTip: DOMPoint | null;
  /** Whether the hand should be visible */
  visible: boolean;
}

export const Hand: React.FC<HandProps> = ({ config, penTip, visible }) => {
  if (!penTip || !visible) return null;

  // Position the image so that penOffsetX/Y aligns with the pen tip point
  const left = penTip.x - config.penOffsetX;
  const top = penTip.y - config.penOffsetY;

  return (
    <img
      src={config.imageSrc}
      width={config.width}
      height={config.height}
      style={{
        position: "absolute",
        left,
        top,
        pointerEvents: "none",
        userSelect: "none",
      }}
      alt=""
    />
  );
};
