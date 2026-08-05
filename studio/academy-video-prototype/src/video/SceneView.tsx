import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  Beat,
  ComparisonCard,
  MetricCard,
  Scene,
  SceneTiming,
  StrictPresentationContract,
} from "../types";
import {StrictIllustration} from "./StrictIllustration";

const ACCENT = "#D7E3DA";
export type MotionProfile = "legacy" | "stable";

const MotionProfileContext = React.createContext<MotionProfile>("stable");
const StrictNarrativeEntrancesContext = React.createContext(false);

const Enter: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({
  children,
  delay = 0,
  className,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const motionProfile = React.useContext(MotionProfileContext);
  const strictNarrativeEntrances = React.useContext(
    StrictNarrativeEntrancesContext,
  );
  const effectiveDelay = strictNarrativeEntrances ? 0 : delay;
  const legacyProgress = spring({
    frame: frame - effectiveDelay,
    fps,
    config: {damping: 20, stiffness: 110, mass: 0.8},
    durationInFrames: 20,
  });
  const stableProgress = interpolate(
    frame,
    [effectiveDelay, effectiveDelay + 14],
    [0, 1],
    {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    },
  );
  const progress =
    motionProfile === "stable" ? stableProgress : legacyProgress;
  const entranceOffset =
    motionProfile === "stable"
      ? Math.round(interpolate(progress, [0, 1], [12, 0]))
      : interpolate(progress, [0, 1], [34, 0]);
  const scale =
    motionProfile === "stable"
      ? 1
      : interpolate(progress, [0, 1], [0.965, 1]);

  return (
    <div
      className={className}
      style={{
        opacity: progress,
        transform:
          motionProfile === "stable"
            ? `translateY(${entranceOffset}px)`
            : `translateY(${entranceOffset}px) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="eyebrow">{children}</div>
);

const IllustrationScene: React.FC<{
  scene: Scene;
  strictPresentationContract?: StrictPresentationContract;
}> = ({scene, strictPresentationContract}) => {
  const placementId = `scene/${scene.id}`;
  const strictPlacement =
    strictPresentationContract?.placements[placementId];
  return (
    <AbsoluteFill
      className={`scene split${strictPlacement ? " strict-split" : ""}`}
      data-course={strictPresentationContract?.course}
      style={{display: "grid"}}
    >
      <div className="copy" data-strict-copy={strictPlacement ? placementId : undefined}>
        <Enter>
          <Eyebrow>{scene.title}</Eyebrow>
        </Enter>
        <div className="display-stack">
          {scene.onScreen.map((line, index) => (
            <Enter
              key={line}
              delay={8 + index * 9}
            >
              <div
                className={
                  index === scene.onScreen.length - 1
                    ? "display accent"
                    : "display"
                }
              >
                {line}
              </div>
            </Enter>
          ))}
        </div>
      </div>
      {strictPlacement && strictPresentationContract ? (
        <StrictIllustration
          contract={strictPresentationContract}
          placementId={placementId}
        />
      ) : (
        <Enter delay={14} className="illustration-wrap">
          <div className="illustration-motion">
            {scene.visual.asset ? (
              <Img
                className="illustration"
                src={staticFile(scene.visual.asset)}
                alt=""
              />
            ) : null}
          </div>
        </Enter>
      )}
    </AbsoluteFill>
  );
};

const TimelineScene: React.FC<{scene: Scene}> = ({scene}) => {
  const stepDelays = [100, 140, 170];

  return (
    <AbsoluteFill className="scene centered">
      <Enter>
        <Eyebrow>{scene.title}</Eyebrow>
      </Enter>
      <div className="timeline">
        {scene.onScreen.map((item, index) => (
          <React.Fragment key={item}>
            <Enter
              delay={stepDelays[index]}
              className="timeline-step"
            >
              <div
                className={
                  index === 2 ? "timeline-dot filled" : "timeline-dot"
                }
              />
              <div className="timeline-label">{item}</div>
            </Enter>
            {index < scene.onScreen.length - 1 ? (
              <Enter delay={stepDelays[index] + 18} className="timeline-line">
                <span />
              </Enter>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CashExampleScene: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill className="scene">
    <Enter>
      <Eyebrow>{scene.title}</Eyebrow>
    </Enter>
    <div className="example-grid">
      <Enter delay={8} className="metric-card">
        <div className="metric-label">Mission facturée</div>
        <div className="metric-value">30 000 €</div>
      </Enter>
      <Enter delay={18} className="metric-card">
        <div className="metric-label">Gain final</div>
        <div className="metric-value">+8 000 €</div>
      </Enter>
      <Enter delay={28} className="metric-card">
        <div className="metric-label">Argent disponible</div>
        <div className="metric-value">9 000 €</div>
      </Enter>
      <Enter
        delay={38}
        className="metric-card critical"
      >
        <div className="metric-label">Point bas avant paiement</div>
        <div className="metric-value">−7 000 €</div>
      </Enter>
    </div>
    <Enter delay={52} className="example-rule">
      <span>Résultat final</span>
      <strong>+8 000 €</strong>
      <i />
      <span>Trésorerie au mauvais moment</span>
      <strong>−7 000 €</strong>
    </Enter>
  </AbsoluteFill>
);

const DefinitionScene: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill className="scene centered">
    <Enter>
      <Eyebrow>{scene.title}</Eyebrow>
    </Enter>
    <div className="definition">
      <Enter delay={10}>
        <span>Le décalage entre</span>
      </Enter>
      <div className="definition-row">
        <Enter delay={18}>
          <strong>dépenses</strong>
        </Enter>
        <Enter delay={26}>
          <span className="definition-arrow">→</span>
        </Enter>
        <Enter delay={34}>
          <strong>encaissements</strong>
        </Enter>
      </div>
      <Enter delay={46}>
        <div className="bfr-pill">BFR</div>
      </Enter>
    </div>
  </AbsoluteFill>
);

const GrowthScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const growth = interpolate(frame, [18, 70], [0.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene growth-scene">
      <Enter>
        <Eyebrow>{scene.title}</Eyebrow>
      </Enter>
      <div className="growth-layout">
        <div className="invoice-stack">
          {[0, 1, 2].map((item) => (
            <div
              className="invoice"
              key={item}
              style={{
                transform: `translate(${item * 28}px, ${
                  -item * 32
                }px) scale(${growth})`,
              }}
            >
              <span />
              <span />
              <span className="short" />
            </div>
          ))}
        </div>
        <div className="growth-copy">
          {scene.onScreen.map((line, index) => (
            <Enter key={line} delay={10 + index * 12}>
              <div className={index === 2 ? "display accent" : "display"}>
                {line}
              </div>
            </Enter>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LowPointScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [12, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="scene low-point-scene">
      <Enter>
        <Eyebrow>{scene.title}</Eyebrow>
      </Enter>
      <div className="low-point-layout">
        <svg
          viewBox="0 0 900 360"
          className="cash-chart"
        >
          <line x1="45" y1="300" x2="855" y2="300" className="chart-axis" />
          <line x1="45" y1="50" x2="45" y2="300" className="chart-axis" />
          <path
            d="M45 90 C180 105 250 150 340 165 C430 180 475 270 560 270 C650 270 730 180 855 120"
            className="chart-line"
            style={{strokeDasharray: 1050, strokeDashoffset: 1050 * (1 - draw)}}
          />
          <circle
            cx="560"
            cy="270"
            r={13}
            fill={ACCENT}
            opacity={draw}
          />
          <text x="560" y="335" textAnchor="middle" className="chart-label">
            point bas
          </text>
        </svg>
        <div className="question-stack">
          {scene.onScreen.map((line, index) => (
            <Enter key={line} delay={24 + index * 10}>
              <div className={index === 0 ? "question primary" : "question"}>
                {line}
              </div>
            </Enter>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ClosingScene: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill className="scene centered closing">
    <Enter className="closing-eyebrow">
      <Eyebrow>{scene.title}</Eyebrow>
    </Enter>
    <div className="closing-copy">
      {scene.onScreen.map((line, index) => (
        <Enter
          key={line}
          delay={10 + index * 10}
        >
          <div className={index === 1 ? "display accent" : "display"}>{line}</div>
        </Enter>
      ))}
    </div>
    <Enter delay={34}>
      <div className="brand">Demaa</div>
    </Enter>
  </AbsoluteFill>
);

const SlowZoom: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const motionProfile = React.useContext(MotionProfileContext);
  const zoom = interpolate(
    frame,
    [Math.round(fps * 0.8), Math.round(fps * 8.5)],
    [1, 1.018],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  if (motionProfile === "stable") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <AbsoluteFill
      style={{transform: `scale(${zoom})`, transformOrigin: "center center"}}
    >
      {children}
    </AbsoluteFill>
  );
};

const StatementScene: React.FC<{
  eyebrow?: string;
  lines: string[];
  accentIndex?: number;
  zoom?: boolean;
}> = ({eyebrow, lines, accentIndex = lines.length - 1, zoom = false}) => {
  const content = (
    <AbsoluteFill className="scene centered statement-scene">
      {eyebrow ? (
        <Enter>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Enter>
      ) : null}
      <div className="statement-copy">
        {lines.map((line, index) => (
          <Enter key={line} delay={8 + index * 8}>
            <div
              className={
                index === accentIndex
                  ? "statement-line accent"
                  : "statement-line"
              }
            >
              {line}
            </div>
          </Enter>
        ))}
      </div>
    </AbsoluteFill>
  );

  return zoom ? <SlowZoom>{content}</SlowZoom> : content;
};

const RealityComparisonScene: React.FC<{
  eyebrow: string;
  sign: string;
  left: ComparisonCard;
  right: ComparisonCard;
  rightDelay?: number;
  rowClass?: string;
}> = ({eyebrow, sign, left, right, rightDelay = 24, rowClass}) => (
  <AbsoluteFill className="scene centered compact-comparison">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <div className={`reality-row${rowClass ? ` ${rowClass}` : ""}`}>
      <Enter delay={8} className="reality-card">
        <span>{left.label}</span>
        <strong>{left.title}</strong>
        {left.detail ? <small>{left.detail}</small> : null}
      </Enter>
      <Enter delay={16} className="reality-sign">
        {sign}
      </Enter>
      <Enter delay={rightDelay} className="reality-card accent-card">
        <span>{right.label}</span>
        <strong>{right.title}</strong>
        {right.detail ? <small>{right.detail}</small> : null}
      </Enter>
    </div>
  </AbsoluteFill>
);

const ChipsScene: React.FC<{
  eyebrow: string;
  title: string;
  items: string[];
}> = ({eyebrow, title, items}) => (
  <AbsoluteFill className="scene centered expense-scene">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <Enter delay={8}>
      <div
        className="expense-title"
        style={{
          maxWidth: 1380,
          fontSize: title.length >= 38 ? 74 : undefined,
        }}
      >
        {title}
      </div>
    </Enter>
    <div className="expense-row">
      {items.map((item, index) => (
        <Enter
          key={item}
          delay={34 + index * 23}
          className="expense-chip"
        >
          {item}
        </Enter>
      ))}
    </div>
  </AbsoluteFill>
);

const ExamplePairScene: React.FC<{
  eyebrow: string;
  left: {label: string; value: string};
  right: {label: string; value: string};
}> = ({eyebrow, left, right}) => (
  <AbsoluteFill className="scene centered example-beat">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <div className="example-pair">
      <Enter delay={170} className="example-stat">
        <span>{left.label}</span>
        <strong>{left.value}</strong>
      </Enter>
      <Enter delay={300} className="example-arrow">
        →
      </Enter>
      <Enter delay={315} className="example-stat accent-card">
        <span>{right.label}</span>
        <strong>{right.value}</strong>
      </Enter>
    </div>
  </AbsoluteFill>
);

const MetricsScene: React.FC<{
  eyebrow: string;
  cards: MetricCard[];
}> = ({eyebrow, cards}) => (
  <AbsoluteFill className="scene centered metrics-scene">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <div className="funding-grid">
      {cards.map((card, index) => (
        <Enter
          key={`${card.label}-${card.value}`}
          delay={[8, 150, 210][index] ?? 8 + index * 60}
          className={`funding-card${card.accent ? " accent-card" : ""}`}
        >
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </Enter>
      ))}
    </div>
  </AbsoluteFill>
);

const PaperBankScene: React.FC<{
  eyebrow: string;
  middle: string;
  left: {label: string; value: string};
  right: {label: string; value: string};
}> = ({eyebrow, middle, left, right}) => (
  <AbsoluteFill className="scene centered paper-bank-scene">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <div className="paper-bank-row">
      <Enter delay={8} className="paper-bank-card">
        <span>{left.label}</span>
        <strong>{left.value}</strong>
      </Enter>
      <Enter delay={45} className="paper-bank-divider">
        {middle}
      </Enter>
      <Enter delay={75} className="paper-bank-card critical-card">
        <span>{right.label}</span>
        <strong>{right.value}</strong>
      </Enter>
    </div>
  </AbsoluteFill>
);

const TermScene: React.FC<{
  eyebrow: string;
  term: string;
  definition: string;
}> = ({eyebrow, term, definition}) => (
  <AbsoluteFill className="scene centered bfr-scene">
    <Enter>
      <Eyebrow>{eyebrow}</Eyebrow>
    </Enter>
    <Enter delay={8}>
      <div
        className="bfr-title"
        style={{fontSize: term.length >= 15 ? 164 : undefined}}
      >
        {term}
      </div>
    </Enter>
    <Enter delay={18}>
      <div className="bfr-subtitle">{definition}</div>
    </Enter>
  </AbsoluteFill>
);

const ActionScene: React.FC<{
  number: string;
  title: string;
  detail: string;
  tags: string[];
}> = ({number, title, detail, tags}) => (
  <AbsoluteFill className="scene action-scene" style={{display: "grid"}}>
    <Enter>
      <div className="action-number">{number}</div>
    </Enter>
    <div className="action-copy">
      <Enter delay={8}>
        <div className="action-title">{title}</div>
      </Enter>
      <Enter delay={16}>
        <div className="action-detail">{detail}</div>
      </Enter>
      <div className="action-tags">
        {tags.map((tag, index) => (
          <Enter key={tag} delay={24 + index * 7} className="action-tag">
            {tag}
          </Enter>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const IllustratedBeatScene: React.FC<{
  beat: Beat;
  sceneId: string;
  strictPresentationContract?: StrictPresentationContract;
}> = ({beat, sceneId, strictPresentationContract}) => {
  if (!beat.illustration) {
    return null;
  }

  const {asset, characterIds, fit = "single", offsetX = 0, scale = 1} =
    beat.illustration;
  const placementId = `beat/${sceneId}/${beat.id}`;
  const strictPlacement =
    strictPresentationContract?.placements[placementId];
  const copy =
    beat.template === "statement" ? (
      <>
        {beat.eyebrow ? (
          <Enter>
            <Eyebrow>{beat.eyebrow}</Eyebrow>
          </Enter>
        ) : null}
        <div className="illustrated-beat__statement">
          {beat.lines.map((line, index) => (
            <Enter key={line} delay={8 + index * 8}>
              <div
                className={
                  index === (beat.accentIndex ?? beat.lines.length - 1)
                    ? "illustrated-beat__line accent"
                    : "illustrated-beat__line"
                }
              >
                {line}
              </div>
            </Enter>
          ))}
        </div>
      </>
    ) : beat.template === "action" ? (
      <>
        <Enter>
          <div className="illustrated-beat__number">{beat.number}</div>
        </Enter>
        <Enter delay={8}>
          <div className="illustrated-beat__title">{beat.title}</div>
        </Enter>
        <Enter delay={16}>
          <div className="illustrated-beat__detail">{beat.detail}</div>
        </Enter>
        <div className="illustrated-beat__tags">
          {beat.tags.map((tag, index) => (
            <Enter
              key={tag}
              delay={24 + index * 7}
              className="illustrated-beat__tag"
            >
              {tag}
            </Enter>
          ))}
        </div>
      </>
    ) : null;

  return (
    <AbsoluteFill
      className={`scene split illustrated-beat illustrated-beat--${fit}${
        strictPlacement ? " strict-split" : ""
      }`}
      data-character-ids={characterIds.join(",")}
      style={{display: "grid"}}
    >
      <div className="copy" data-strict-copy={strictPlacement ? placementId : undefined}>
        {copy}
      </div>
      {strictPlacement && strictPresentationContract ? (
        <StrictIllustration
          contract={strictPresentationContract}
          placementId={placementId}
        />
      ) : (
        <Enter delay={14} className="illustration-wrap">
          <div
            className="illustration-motion illustrated-beat__motion"
            style={{
              transform: `translateX(${offsetX}px) scale(${scale})`,
            }}
          >
            <Img
              className="illustration illustrated-beat__asset"
              src={staticFile(asset)}
              alt=""
            />
          </div>
        </Enter>
      )}
    </AbsoluteFill>
  );
};

const BeatSequence: React.FC<{
  from: number;
  duration: number;
  children: React.ReactNode;
}> = ({from, duration, children}) => (
  <Sequence from={from} durationInFrames={duration}>
    {children}
  </Sequence>
);

const SceneViewContent: React.FC<{
  scene: Scene;
  durationInFrames: number;
  timing?: SceneTiming;
  strictPresentationContract?: StrictPresentationContract;
}> = ({
  scene,
  durationInFrames,
  timing,
  strictPresentationContract,
}) => {
  const {fps} = useVideoConfig();
  const renderBeat = (beat: Beat) => {
    if (
      beat.illustration &&
      (beat.template === "statement" || beat.template === "action")
    ) {
      return (
        <IllustratedBeatScene
          beat={beat}
          sceneId={scene.id}
          strictPresentationContract={strictPresentationContract}
        />
      );
    }

    switch (beat.template) {
      case "statement":
        return (
          <StatementScene
            eyebrow={beat.eyebrow}
            lines={beat.lines}
            accentIndex={beat.accentIndex}
            zoom={beat.zoom}
          />
        );
      case "comparison":
        return (
          <RealityComparisonScene
            eyebrow={beat.eyebrow}
            sign={beat.sign}
            left={beat.left}
            right={beat.right}
            rightDelay={beat.rightDelay}
            rowClass={beat.rowClass}
          />
        );
      case "timeline":
        return <TimelineScene scene={scene} />;
      case "chips":
        return (
          <ChipsScene
            eyebrow={beat.eyebrow}
            title={beat.title}
            items={beat.items}
          />
        );
      case "example-pair":
        return (
          <ExamplePairScene
            eyebrow={beat.eyebrow}
            left={beat.left}
            right={beat.right}
          />
        );
      case "metrics":
        return <MetricsScene eyebrow={beat.eyebrow} cards={beat.cards} />;
      case "paper-bank":
        return (
          <PaperBankScene
            eyebrow={beat.eyebrow}
            middle={beat.middle}
            left={beat.left}
            right={beat.right}
          />
        );
      case "term":
        return (
          <TermScene
            eyebrow={beat.eyebrow}
            term={beat.term}
            definition={beat.definition}
          />
        );
      case "growth":
        return <GrowthScene scene={scene} />;
      case "low-point":
        return <LowPointScene scene={scene} />;
      case "action":
        return (
          <ActionScene
            number={beat.number}
            title={beat.title}
            detail={beat.detail}
            tags={beat.tags}
          />
        );
    }
  };

  if (scene.beats?.length) {
    const starts = scene.beats.map((beat, index) =>
      index === 0
        ? 0
        : Math.max(
            1,
            Math.min(
              durationInFrames - 1,
              Math.round(
                (timing?.beats?.[beat.id]?.startSeconds ??
                  beat.startSeconds) * fps,
              ),
            ),
          ),
    );

    return (
      <AbsoluteFill>
        {scene.beats.map((beat, index) => {
          const from = starts[index];
          const until = starts[index + 1] ?? durationInFrames;
          return (
            <BeatSequence
              key={beat.id}
              from={from}
              duration={Math.max(1, until - from)}
            >
              {renderBeat(beat)}
            </BeatSequence>
          );
        })}
      </AbsoluteFill>
    );
  }

  switch (scene.visual.type) {
    case "illustration":
      return (
        <IllustrationScene
          scene={scene}
          strictPresentationContract={strictPresentationContract}
        />
      );
    case "timeline":
      return <TimelineScene scene={scene} />;
    case "cash-example":
      return <CashExampleScene scene={scene} />;
    case "definition":
      return <DefinitionScene scene={scene} />;
    case "growth":
      return <GrowthScene scene={scene} />;
    case "low-point":
      return <LowPointScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    default:
      return (
        <IllustrationScene
          scene={scene}
          strictPresentationContract={strictPresentationContract}
        />
      );
  }
};

export const SceneView: React.FC<{
  scene: Scene;
  durationInFrames: number;
  timing?: SceneTiming;
  motionProfile?: MotionProfile;
  strictPresentationContract?: StrictPresentationContract;
}> = ({
  scene,
  durationInFrames,
  timing,
  motionProfile = "stable",
  strictPresentationContract,
}) => (
  <MotionProfileContext.Provider value={motionProfile}>
    <StrictNarrativeEntrancesContext.Provider
      value={strictPresentationContract?.strictNarrativeEntrances === true}
    >
      <SceneViewContent
        scene={scene}
        durationInFrames={durationInFrames}
        timing={timing}
        strictPresentationContract={strictPresentationContract}
      />
    </StrictNarrativeEntrancesContext.Provider>
  </MotionProfileContext.Provider>
);
