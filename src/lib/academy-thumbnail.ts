export const ACADEMY_THUMBNAIL_CANVAS = {
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
} as const;

export const ACADEMY_THUMBNAIL_TARGET_CROP_RATIO = 4 / 3;

export type AcademyThumbnailComposition = {
  artwork: {
    scale: number;
    offsetXPercent: number;
    offsetYPercent: number;
  };
  title: {
    scale: number;
    offsetXPercent: number;
    offsetYPercent: number;
  };
  safeZone: {
    targetAspectRatio: typeof ACADEMY_THUMBNAIL_TARGET_CROP_RATIO;
    minimumSafeAspectRatio: number;
  };
};

export const DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION: AcademyThumbnailComposition =
  {
    artwork: {
      scale: 1,
      offsetXPercent: 0,
      offsetYPercent: 0,
    },
    title: {
      scale: 1,
      offsetXPercent: 0,
      offsetYPercent: 0,
    },
    safeZone: {
      targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
      minimumSafeAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
    },
  };
