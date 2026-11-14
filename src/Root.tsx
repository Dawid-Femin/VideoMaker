import { Composition } from "remotion";
import { WhiteboardScene } from "./renderer/WhiteboardScene";
import { loadScene } from "./data/loader";
import type { Scene } from "./types/Scene";
import type { AnyZodObject } from "zod";

import sceneData from "../scene-data/scene.json";

const scene = loadScene(sceneData);

type WhiteboardSceneProps = { scene: Scene };

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<AnyZodObject, WhiteboardSceneProps>
      id="WhiteboardScene"
      component={WhiteboardScene}
      durationInFrames={scene.fps * scene.durationInSeconds}
      fps={scene.fps}
      width={scene.width}
      height={scene.height}
      defaultProps={{ scene }}
    />
  );
};
