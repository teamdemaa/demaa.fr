import React from "react";
import {Img, staticFile} from "remotion";
import type {
  StrictIllustrationPlacementContract,
  StrictPresentationContract,
} from "../types";

export type VisibleRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number;
};

export const getStrictVisibleRectangle = ({
  contract,
  placement,
}: {
  contract: StrictPresentationContract;
  placement: StrictIllustrationPlacementContract;
}): VisibleRectangle => {
  const asset = contract.assets[placement.asset];
  const slot = contract.slots[placement.slot];
  if (!asset) {
    throw new Error(`Asset absent du contrat strict : ${placement.asset}`);
  }
  if (!slot) {
    throw new Error(`Slot absent du contrat strict : ${placement.slot}`);
  }
  const scale = slot.targetVisibleHeight / asset.alphaBoundingBox.height;
  const width = asset.alphaBoundingBox.width * scale;
  const height = asset.alphaBoundingBox.height * scale;
  return {
    x: slot.center.x - width / 2,
    y: slot.center.y - height / 2,
    width,
    height,
    centerX: slot.center.x,
    centerY: slot.center.y,
    scale,
  };
};

export const StrictIllustration: React.FC<{
  contract: StrictPresentationContract;
  placementId: string;
  className?: string;
  opacity?: number;
  translateX?: number;
}> = ({
  contract,
  placementId,
  className,
  opacity = 1,
  translateX = 0,
}) => {
  const placement = contract.placements[placementId];
  if (!placement) {
    throw new Error(`Placement strict absent : ${placementId}`);
  }
  const asset = contract.assets[placement.asset];
  const slot = contract.slots[placement.slot];
  const rectangle = getStrictVisibleRectangle({contract, placement});
  const alphaCenterX =
    asset.alphaBoundingBox.x + asset.alphaBoundingBox.width / 2;
  const alphaCenterY =
    asset.alphaBoundingBox.y + asset.alphaBoundingBox.height / 2;
  const renderedWidth = asset.imageWidth * rectangle.scale;
  const renderedHeight = asset.imageHeight * rectangle.scale;

  return (
    <div
      className={`strict-illustration-slot${className ? ` ${className}` : ""}`}
      data-strict-placement={placementId}
      data-strict-slot={placement.slot}
      data-strict-visible-height={rectangle.height.toFixed(3)}
      data-strict-visible-width={rectangle.width.toFixed(3)}
      data-strict-visible-center-x={rectangle.centerX.toFixed(3)}
      data-strict-visible-center-y={rectangle.centerY.toFixed(3)}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateX(${Math.round(translateX)}px)`,
        pointerEvents: "none",
      }}
    >
      <Img
        className="strict-illustration-asset"
        data-strict-asset={placement.asset}
        src={staticFile(placement.asset)}
        alt=""
        style={{
          position: "absolute",
          left: slot.center.x - alphaCenterX * rectangle.scale,
          top: slot.center.y - alphaCenterY * rectangle.scale,
          width: renderedWidth,
          height: renderedHeight,
          maxWidth: "none",
          maxHeight: "none",
          objectFit: "fill",
        }}
      />
    </div>
  );
};
