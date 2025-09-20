import React from "react";
import { Composition } from "remotion";
import { AIVideo } from "./compositions/AiVideo";
import { HelloWorld } from "./compositions/HelloWorld";
import { ExcalidrawRenderer, ExcalidrawRendererProps } from "./excalidraw/ExcalidrawRenderer";
import { SimpleExcalidraw } from "./compositions/SimpleExcalidraw";
import { SmarterVideo } from "./compositions/SmarterVideo";
import { ADHDProductivityVideo } from "./compositions/ADHDProductivityVideo";
import { ADHDQuickTest } from "./compositions/ADHDQuickTest";
import { AnalysisJson } from "./excalidraw/types";

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
      <Composition
        id="ExcalidrawDemo"
        component={ExcalidrawRenderer}
        durationInFrames={900} // 30 saniye 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scene: {
            elements: [
              {
                id: "demo-text",
                type: "text",
                x: 100,
                y: 100,
                width: 400,
                height: 100,
                angle: 0,
                strokeColor: "#1e1e1e",
                backgroundColor: "transparent",
                fillStyle: "hachure",
                strokeWidth: 2,
                strokeStyle: "solid",
                roughness: 1,
                opacity: 1,
                seed: 12345,
                versionNonce: 123,
                isDeleted: false,
                text: "Merhaba Dünya!",
                fontSize: 48,
                fontFamily: 1,
                textAlign: "center",
                verticalAlign: "middle"
              }
            ],
            appState: {
              viewBackgroundColor: "#ffffff"
            }
          },
          animated: true,
          animationType: "progressive-draw",
          animationSpeed: "normal",
          useRoughStyle: true,
          roughStylePreset: "handDrawn"
        }}
      />
      <Composition
        id="SimpleExcalidraw"
        component={SimpleExcalidraw}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SmarterVideo"
        component={SmarterVideo}
        durationInFrames={1440} // 60 saniye 24fps
        fps={24}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Can you really make yourself smarter by just doing one thing consistently?"
        }}
      />
      <Composition
        id="ADHDProductivity"
        component={ADHDProductivityVideo}
        durationInFrames={1800} // 60 saniye 30fps - FIXED
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ADHDQuickTest"
        component={ADHDQuickTest}
        durationInFrames={150} // 5 saniye 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
