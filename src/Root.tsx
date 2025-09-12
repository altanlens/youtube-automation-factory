import React from "react";
import { Composition } from "remotion";
import { AIVideo } from "./compositions/AIVideo";
import { Main } from "./compositions/Main";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={3000} // 100 saniye 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "YouTube Automation Factory",
          subtitle: "AI Powered Video Generation",
        }}
      />
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={3600} // 120 saniye 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          script: "Default script text",
          audioPath: "",
          scenes: [],
          title: "AI Generated Video",
        }}
      />
    </>
  );
};
