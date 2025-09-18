import React from "react";
import { Composition } from "remotion";
import { AIVideo } from "./compositions/AiVideo";
import { HelloWorld } from "./compositions/HelloWorld";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "black",
        }}
      />
      <Composition
        id="AiVideo"
        component={AIVideo}
        durationInFrames={3600} // 120 saniye 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioUrl: "",
          subtitles: [],
        }}
      />
    </>
  );
};
