export type Layout =
  | "text-left"
  | "comparison"
  | "full"
  | "center"
  | "actions";

export type VisualType =
  | "illustration"
  | "timeline"
  | "cash-example"
  | "definition"
  | "growth"
  | "low-point"
  | "closing";

export type ComparisonCard = {
  label: string;
  title: string;
  detail?: string;
};

export type MetricCard = {
  label: string;
  value: string;
  accent?: boolean;
};

export type BeatIllustration = {
  asset: string;
  characterIds: number[];
  scale?: number;
  offsetX?: number;
  fit?: "single" | "group";
};

export type AlphaBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StrictIllustrationAssetContract = {
  sha256: string;
  imageWidth: number;
  imageHeight: number;
  alphaThreshold: number;
  alphaBoundingBox: AlphaBoundingBox;
};

export type StrictIllustrationSlotContract = {
  kind: "character-single" | "character-group" | "full-illustration";
  targetVisibleHeight: number;
  tolerancePercent: number;
  center: {x: number; y: number};
};

export type StrictIllustrationPlacementContract = {
  asset: string;
  slot: string;
  copyBounds: {x: number; y: number; width: number; height: number};
};

export type StrictPresentationContract = {
  version: number;
  course: string;
  strictNarrativeEntrances: boolean;
  frame: {width: number; height: number; fps: number};
  safeZone: {x: number; y: number; width: number; height: number};
  thresholds: {
    continuityScalePercent: number;
    continuityCentroidPixels: number;
    minimumCopyGapPixels: number;
  };
  slots: Record<string, StrictIllustrationSlotContract>;
  assets: Record<string, StrictIllustrationAssetContract>;
  placements: Record<string, StrictIllustrationPlacementContract>;
};

type BeatContent =
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "statement";
      eyebrow?: string;
      lines: string[];
      accentIndex?: number;
      zoom?: boolean;
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "comparison";
      eyebrow: string;
      sign: string;
      left: ComparisonCard;
      right: ComparisonCard;
      rightDelay?: number;
      rowClass?: string;
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "timeline";
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "chips";
      eyebrow: string;
      title: string;
      items: string[];
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "example-pair";
      eyebrow: string;
      left: {label: string; value: string};
      right: {label: string; value: string};
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "metrics";
      eyebrow: string;
      cards: MetricCard[];
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "paper-bank";
      eyebrow: string;
      middle: string;
      left: {label: string; value: string};
      right: {label: string; value: string};
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "term";
      eyebrow: string;
      term: string;
      definition: string;
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "growth";
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "low-point";
    }
  | {
      id: string;
      startSeconds: number;
      cue?: string;
      template: "action";
      number: string;
      title: string;
      detail: string;
      tags: string[];
    };

export type Beat = BeatContent & {
  illustration?: BeatIllustration;
};

export type Scene = {
  id: string;
  title: string;
  targetSeconds: number;
  narration: string;
  onScreen: string[];
  visual: {
    type: VisualType;
    asset?: string;
    assetScale?: number;
    assetOffsetX?: number;
    layout: Layout;
  };
  beats?: Beat[];
};

export type Pilot = {
  id: string;
  title: string;
  shortTitle: string;
  courseTitle?: string;
  introVisual?: {
    primaryLabel: string;
    secondaryLabel: string;
  };
  format: {
    width: number;
    height: number;
    fps: number;
    targetDurationSeconds: number;
  };
  strictPresentationContract?: StrictPresentationContract;
  scenes: Scene[];
};

export type SceneTiming = {
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  speechStartSeconds: number;
  speechEndSeconds: number;
  beats?: Record<
    string,
    {
      startSeconds: number;
      cueStartSeconds: number;
      leadSeconds: number;
    }
  >;
};

export type GeneratedTiming = {
  source: string;
  audioDurationSeconds: number;
  totalDurationSeconds: number;
  scenes: Record<string, SceneTiming>;
};
