import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./compositions/HelloWorld";
import {
  AiVideo,
  AiVideoProps,
  calculateVideoDuration,
} from "./compositions/AiVideo";
import "./style.css";

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
          titleColor: "rgb(0, 123, 255)",
        }}
      />

      {/* AI Video Kompozisyonu - Dinamik süre ile */}
      <Composition
        id="AiVideo"
        component={AiVideo}
        // ❌ Eski sabit süre kaldırıldı: durationInFrames={900}
        // ✅ Yeni dinamik süre hesaplama:
        calculateMetadata={({ props }) => {
          const subtitles = props.subtitles || [];
          const duration = calculateVideoDuration(subtitles);

          return {
            durationInFrames: duration * 30, // 30 fps ile çarp
            fps: 30,
            width: 1920,
            height: 1080,
          };
        }}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          subtitles: [
            {
              text: "Bu bir test altyazısıdır.",
              start: 1,
              duration: 3,
              imageUrl: null, // imageUrl alanı eklendi
            },
          ],
          totalDurationInSeconds: 60, // Varsayılan maksimum süre
        }}
      />
    </>
  );
};
