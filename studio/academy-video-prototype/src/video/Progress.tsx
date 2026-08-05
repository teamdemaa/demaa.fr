import React from "react";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const width = interpolate(frame, [0, durationInFrames - 1], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="progress-track">
      <div className="progress-value" style={{width: `${width}%`}} />
    </div>
  );
};
