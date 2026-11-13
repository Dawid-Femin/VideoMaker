import { Composition } from "remotion";
import { WhiteboardScene } from "./renderer/WhiteboardScene";
import { sampleScene } from "./data/sampleScene";
import type { Scene } from "./types/Scene";
import type { AnyZodObject } from "zod";

type WhiteboardSceneProps = { scene: Scene };

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<AnyZodObject, WhiteboardSceneProps>
      id="WhiteboardScene"
      component={WhiteboardScene}
      durationInFrames={sampleScene.fps * sampleScene.durationInSeconds}
      fps={sampleScene.fps}
      width={sampleScene.width}
      height={sampleScene.height}
      defaultProps={{ scene: sampleScene }}
    />
  );
};
