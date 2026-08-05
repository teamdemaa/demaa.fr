import {Audio} from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {Pilot, Scene} from "../types";

const GREEN = "#305F46";
const MINT = "#D7E3DA";
const CREAM = "#F4EBDD";
const BROWN = "#321B14";
const GOLD = "#E1A900";
const BURGUNDY = "#7C1F2B";

const image = (filename: string) =>
  `courses/juste-systeme-marketing/images/${filename}`;

const assets = {
  brand: image("07-brand-reveal-juste.png"),
  boxOpen: image("06-flash-box-opening.png"),
  forest: image("01-impact-foret-noire-break.png"),
  tatin: image("02-flash-tarte-tatin.png"),
  hibiscus: image("04-flash-hibiscus.png"),
  chocolate: image("05-flash-chocolate-chip.png"),
  tasting: image("14-street-tasting-wide.png"),
  guess: image("15-street-flavor-guess.png"),
  filming: image("16-content-filming.png"),
  testing: image("13-recipe-testing.png"),
  packing: image("19-product-packing.png"),
  unboxing: image("20-home-unboxing.png"),
  sharing: image("21-office-sharing.png"),
  lastBite: image("12-positioning-last-bite.png"),
};

type Variant =
  | "master"
  | "short-problem"
  | "short-content"
  | "short-ads"
  | "short-economics";

type Clip = {
  sceneId: string;
  seconds: number;
};

const shortClips: Record<Exclude<Variant, "master">, Clip[]> = {
  "short-problem": [
    {sceneId: "juste-donne-envie", seconds: 14},
    {sceneId: "produit-sans-ventes", seconds: 25},
    {sceneId: "demaa-systeme", seconds: 18},
  ],
  "short-content": [{sceneId: "attirer-ecosysteme", seconds: 50}],
  "short-ads": [{sceneId: "attirer-amplifier", seconds: 60}],
  "short-economics": [{sceneId: "transformer-offre", seconds: 55}],
};

const ease = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 22, stiffness: 105, mass: 0.85},
    durationInFrames: 24,
  });

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({children, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = ease(frame, fps, delay);
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [28, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Kicker: React.FC<{children: React.ReactNode; light?: boolean}> = ({
  children,
  light = false,
}) => (
  <div
    style={{
      color: light ? CREAM : MINT,
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const BrandChrome: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: portrait ? 54 : 38,
          left: portrait ? 58 : 64,
          zIndex: 50,
          color: "rgba(255,255,255,0.88)",
          fontFamily: "Gambetta, serif",
          fontSize: portrait ? 30 : 25,
          fontStyle: "italic",
        }}
      >
        Demaa
      </div>
      <div
        style={{
          position: "absolute",
          right: portrait ? 58 : 64,
          top: portrait ? 60 : 43,
          zIndex: 50,
          color: "rgba(255,255,255,0.72)",
          fontSize: portrait ? 18 : 16,
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        JUSTE · {String(index + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          height: portrait ? 8 : 6,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            width: `${((index + 1) / total) * 100}%`,
            height: "100%",
            background: MINT,
          }}
        />
      </div>
    </>
  );
};

const Photo: React.FC<{
  src: string;
  position?: string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({src, position = "center", radius = 28, style}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 240], [1.02, 1.075], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: radius,
        background: CREAM,
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${zoom})`,
        }}
      />
    </div>
  );
};

const GreenStage: React.FC<{
  children: React.ReactNode;
  index: number;
  total: number;
}> = ({children, index, total}) => (
  <AbsoluteFill
    style={{
      overflow: "hidden",
      background: `radial-gradient(circle at 83% 14%, rgba(215,227,218,.11), transparent 28%), ${GREEN}`,
      color: "white",
      fontFamily: "Satoshi, sans-serif",
    }}
  >
    {children}
    <BrandChrome index={index} total={total} />
  </AbsoluteFill>
);

const IntroScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const flashAssets = [
    assets.forest,
    assets.tatin,
    assets.hibiscus,
    assets.chocolate,
    assets.boxOpen,
  ];
  const flashFrames = Math.round(fps * 0.72);
  const flashIndex = Math.min(
    flashAssets.length - 1,
    Math.floor(frame / flashFrames),
  );
  const revealAt = flashFrames * flashAssets.length;

  if (frame < revealAt) {
    return (
      <GreenStage index={index} total={total}>
        <AbsoluteFill>
          <Img
            src={staticFile(flashAssets[flashIndex])}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,.12))",
            }}
          />
        </AbsoluteFill>
      </GreenStage>
    );
  }

  const local = frame - revealAt;
  const progress = ease(local, fps);
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "0.82fr 1.18fr",
          height: "100%",
          gap: portrait ? 34 : 70,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            order: portrait ? 2 : 1,
          }}
        >
          <Kicker>Une marque fictive</Kicker>
          <div
            style={{
              marginTop: 24,
              fontSize: portrait ? 102 : 114,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
            }}
          >
            Ça, c’est
            <br />
            <span style={{color: MINT}}>JUSTE.</span>
          </div>
          <div
            style={{
              maxWidth: 680,
              marginTop: 32,
              color: "rgba(255,255,255,.82)",
              fontSize: portrait ? 38 : 34,
              lineHeight: 1.22,
            }}
          >
            Gourmande jusqu’à la dernière bouchée.
          </div>
        </div>
        <div
          style={{
            minHeight: 0,
            opacity: progress,
            transform: `scale(${interpolate(progress, [0, 1], [0.96, 1])})`,
            order: portrait ? 1 : 2,
          }}
        >
          <Photo
            src={assets.brand}
            position="50% 58%"
            style={{width: "100%", height: "100%"}}
          />
        </div>
      </div>
    </GreenStage>
  );
};

const ProblemScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const metrics = [
    {label: "Depuis", value: "10 mois"},
    {label: "Ventes", value: "5"},
    {label: "Conseils reçus", value: "1 001"},
  ];
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "0.9fr 1.1fr",
          height: "100%",
          gap: portrait ? 36 : 72,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <Photo
          src={assets.lastBite}
          position="50% 45%"
          style={{
            width: "100%",
            height: portrait ? 720 : "100%",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Le problème</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 22,
                fontSize: portrait ? 72 : 74,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.03,
              }}
            >
              Le produit plaît.
              <br />
              <span style={{color: MINT}}>Mais il ne se vend pas.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: portrait ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
              gap: 16,
              marginTop: 42,
            }}
          >
            {metrics.map((metric, metricIndex) => (
              <Reveal
                key={metric.label}
                delay={18 + metricIndex * 8}
                style={{
                  padding: portrait ? "24px 16px" : "30px 24px",
                  border: "2px solid rgba(215,227,218,.34)",
                  borderRadius: 20,
                  background: "rgba(215,227,218,.07)",
                }}
              >
                <div
                  style={{
                    color: MINT,
                    fontSize: portrait ? 17 : 18,
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: portrait ? 42 : 44,
                    fontWeight: 700,
                  }}
                >
                  {metric.value}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </GreenStage>
  );
};

const SystemScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const steps = [
    {number: "01", label: "Attirer"},
    {number: "02", label: "Transformer"},
    {number: "03", label: "Fidéliser"},
  ];
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: portrait ? "150px 58px 110px" : "104px 120px 78px",
        }}
      >
        <Reveal>
          <Kicker>Le système Demaa</Kicker>
        </Reveal>
        <Reveal delay={8}>
          <div
            style={{
              maxWidth: 1300,
              marginTop: 24,
              fontSize: portrait ? 72 : 82,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.03,
            }}
          >
            Pas plus de bruit.
            <br />
            <span style={{color: MINT}}>Une direction claire.</span>
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: portrait ? "1fr" : "repeat(3, 1fr)",
            gap: portrait ? 22 : 26,
            marginTop: 52,
          }}
        >
          {steps.map((step, stepIndex) => (
            <Reveal
              key={step.number}
              delay={20 + stepIndex * 10}
              style={{
                display: "flex",
                minHeight: portrait ? 170 : 220,
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: portrait ? "30px 34px" : "34px 38px",
                border: `2px solid ${
                  stepIndex === 0 ? MINT : "rgba(255,255,255,.25)"
                }`,
                borderRadius: 24,
                background:
                  stepIndex === 0
                    ? "rgba(215,227,218,.11)"
                    : "rgba(255,255,255,.03)",
              }}
            >
              <span style={{color: MINT, fontSize: 24}}>{step.number}</span>
              <strong style={{fontSize: portrait ? 50 : 52}}>
                {step.label}
              </strong>
            </Reveal>
          ))}
        </div>
      </div>
    </GreenStage>
  );
};

const SignatureScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const rotation = interpolate(frame, [0, fps * 2.2], [-34, 326], {
    extrapolateRight: "clamp",
  });
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "1.08fr 0.92fr",
          height: "100%",
          gap: 52,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Étape 1 · Attirer</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 22,
                fontSize: portrait ? 72 : 80,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                lineHeight: 1.02,
              }}
            >
              Une roue.
              <br />
              <span style={{color: MINT}}>Un parfum. Une recette.</span>
            </div>
          </Reveal>
          <Reveal delay={18}>
            <div
              style={{
                marginTop: 34,
                color: "rgba(255,255,255,.76)",
                fontSize: portrait ? 32 : 30,
                lineHeight: 1.25,
              }}
            >
              4 box offertes par mois · budget ≈ 100 €
            </div>
          </Reveal>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: portrait ? 680 : 0,
          }}
        >
          <div
            style={{
              width: portrait ? 610 : 610,
              height: portrait ? 610 : 610,
              transform: `rotate(${rotation}deg)`,
              border: `16px solid ${CREAM}`,
              borderRadius: "50%",
              background: `conic-gradient(${GOLD} 0deg 72deg, ${BROWN} 72deg 144deg, #CF7B24 144deg 216deg, ${BURGUNDY} 216deg 288deg, #B62134 288deg 360deg)`,
              boxShadow: "0 34px 80px rgba(0,0,0,.24)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 142,
              height: 142,
              border: `14px solid ${CREAM}`,
              borderRadius: "50%",
              background: GREEN,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: portrait ? 8 : 24,
              left: "50%",
              width: 0,
              height: 0,
              transform: "translateX(-50%)",
              borderLeft: "34px solid transparent",
              borderRight: "34px solid transparent",
              borderTop: `72px solid ${CREAM}`,
              filter: "drop-shadow(0 8px 8px rgba(0,0,0,.22))",
            }}
          />
        </div>
      </div>
    </GreenStage>
  );
};

const ContentSystemScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const outputs = [
    ["4", "signatures"],
    ["4", "éducatifs"],
    ["4", "coulisses"],
  ];
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "0.84fr 1.16fr",
          height: "100%",
          gap: portrait ? 36 : 62,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <Photo
          src={assets.filming}
          position="50% 48%"
          style={{width: "100%", height: portrait ? 650 : "100%"}}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Le planning</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 22,
                fontSize: portrait ? 72 : 78,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                lineHeight: 1,
              }}
            >
              2 jours
              <br />
              <span style={{color: MINT}}>pour 1 mois.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginTop: 38,
            }}
          >
            {outputs.map(([value, label], outputIndex) => (
              <Reveal
                key={label}
                delay={18 + outputIndex * 9}
                style={{
                  padding: portrait ? "22px 12px" : "28px 18px",
                  borderRadius: 20,
                  background: "rgba(215,227,218,.09)",
                  textAlign: "center",
                }}
              >
                <strong style={{display: "block", fontSize: 54}}>{value}</strong>
                <span style={{color: MINT, fontSize: portrait ? 19 : 21}}>
                  {label}
                </span>
              </Reveal>
            ))}
          </div>
          <Reveal delay={48}>
            <div
              style={{
                marginTop: 28,
                color: "rgba(255,255,255,.8)",
                fontSize: portrait ? 30 : 29,
              }}
            >
              12 contenus · environ 3 publications par semaine
            </div>
          </Reveal>
        </div>
      </div>
    </GreenStage>
  );
};

const AdsScene: React.FC<{index: number; total: number}> = ({index, total}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "1.12fr 0.88fr",
          height: "100%",
          gap: portrait ? 34 : 60,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Le budget publicitaire</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 20,
                fontSize: portrait ? 112 : 126,
                fontWeight: 700,
                letterSpacing: "-0.07em",
                lineHeight: 0.94,
              }}
            >
              500 €
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.2fr",
              gap: 18,
              marginTop: 40,
            }}
          >
            <Reveal
              delay={20}
              style={{
                padding: 30,
                border: `2px solid ${MINT}`,
                borderRadius: 22,
                background: "rgba(215,227,218,.09)",
              }}
            >
              <Kicker>Tester</Kicker>
              <strong style={{display: "block", marginTop: 14, fontSize: 58}}>
                200 €
              </strong>
              <span style={{color: MINT, fontSize: 23}}>4 vidéos · 5 jours</span>
            </Reveal>
            <Reveal
              delay={30}
              style={{
                padding: 30,
                border: "2px solid rgba(255,255,255,.25)",
                borderRadius: 22,
                background: "rgba(255,255,255,.035)",
              }}
            >
              <Kicker>Amplifier</Kicker>
              <strong style={{display: "block", marginTop: 14, fontSize: 58}}>
                300 €
              </strong>
              <span style={{color: MINT, fontSize: 23}}>
                uniquement sur la gagnante
              </span>
            </Reveal>
          </div>
          <Reveal delay={44}>
            <div
              style={{
                marginTop: 28,
                paddingLeft: 22,
                borderLeft: `5px solid ${MINT}`,
                color: "rgba(255,255,255,.82)",
                fontSize: portrait ? 30 : 28,
                lineHeight: 1.24,
              }}
            >
              Mesurer les commandes.
              <br />
              Pas les likes.
            </div>
          </Reveal>
        </div>
        <Photo
          src={assets.tasting}
          position="50% 44%"
          style={{width: "100%", height: portrait ? 720 : "100%"}}
        />
      </div>
    </GreenStage>
  );
};

const EconomicsScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const metrics = [
    {label: "Prix de la box", value: "30 €", accent: false},
    {label: "Coûts variables", value: "−14 €", accent: false},
    {label: "Acquisition maximale", value: "−10 €", accent: true},
    {label: "Reste avant coûts fixes", value: "6 €", accent: false},
  ];
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "0.82fr 1.18fr",
          height: "100%",
          gap: portrait ? 36 : 66,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <Photo
          src={assets.packing}
          position="50% 42%"
          style={{width: "100%", height: portrait ? 620 : "100%"}}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Étape 2 · Transformer</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 20,
                fontSize: portrait ? 66 : 70,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
              }}
            >
              Une offre simple.
              <br />
              <span style={{color: MINT}}>Une économie viable.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              marginTop: 34,
            }}
          >
            {metrics.map((metric, metricIndex) => (
              <Reveal
                key={metric.label}
                delay={18 + metricIndex * 8}
                style={{
                  padding: portrait ? 22 : 24,
                  border: `2px solid ${
                    metric.accent ? MINT : "rgba(255,255,255,.18)"
                  }`,
                  borderRadius: 20,
                  background: metric.accent
                    ? "rgba(215,227,218,.1)"
                    : "rgba(255,255,255,.025)",
                }}
              >
                <div
                  style={{
                    color: MINT,
                    fontSize: portrait ? 18 : 19,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {metric.label}
                </div>
                <strong
                  style={{
                    display: "block",
                    marginTop: 10,
                    fontSize: portrait ? 46 : 48,
                  }}
                >
                  {metric.value}
                </strong>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </GreenStage>
  );
};

const LoyaltyScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const steps = [
    "Panier abandonné",
    "Avis après livraison",
    "Nouveau parfum à J+21",
    "2 newsletters par mois",
  ];
  return (
    <GreenStage index={index} total={total}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "1.08fr 0.92fr",
          height: "100%",
          gap: portrait ? 36 : 66,
          padding: portrait ? "150px 58px 110px" : "104px 92px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Reveal>
            <Kicker>Étape 3 · Fidéliser</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                marginTop: 20,
                fontSize: portrait ? 66 : 72,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
              }}
            >
              Shopify suffit
              <br />
              <span style={{color: MINT}}>pour commencer.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 36,
            }}
          >
            {steps.map((step, stepIndex) => (
              <Reveal
                key={step}
                delay={18 + stepIndex * 7}
                style={{
                  display: "grid",
                  gridTemplateColumns: "46px 1fr",
                  alignItems: "center",
                  gap: 18,
                  padding: portrait ? "18px 20px" : "18px 22px",
                  borderRadius: 18,
                  background:
                    stepIndex === 3
                      ? "rgba(215,227,218,.11)"
                      : "rgba(255,255,255,.04)",
                }}
              >
                <strong style={{color: MINT, fontSize: 22}}>
                  {String(stepIndex + 1).padStart(2, "0")}
                </strong>
                <span style={{fontSize: portrait ? 29 : 28}}>{step}</span>
              </Reveal>
            ))}
          </div>
        </div>
        <Photo
          src={assets.unboxing}
          position="50% 45%"
          style={{width: "100%", height: portrait ? 710 : "100%"}}
        />
      </div>
    </GreenStage>
  );
};

const ClosingScene: React.FC<{index: number; total: number}> = ({
  index,
  total,
}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  return (
    <GreenStage index={index} total={total}>
      <AbsoluteFill>
        <Img
          src={staticFile(assets.brand)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: portrait ? "52% 55%" : "50% 58%",
          }}
        />
        <AbsoluteFill
          style={{
            background: portrait
              ? "linear-gradient(180deg, rgba(48,95,70,.18), rgba(48,95,70,.96) 72%)"
              : "linear-gradient(90deg, rgba(48,95,70,.98) 0%, rgba(48,95,70,.84) 48%, rgba(48,95,70,.18) 100%)",
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          width: portrait ? "100%" : "58%",
          height: "100%",
          flexDirection: "column",
          justifyContent: portrait ? "flex-end" : "center",
          padding: portrait ? "150px 58px 150px" : "104px 92px 78px",
        }}
      >
        <Reveal>
          <Kicker>La règle Demaa</Kicker>
        </Reveal>
        {["Tenable.", "Mesurable.", "Rentable."].map((line, lineIndex) => (
          <Reveal key={line} delay={10 + lineIndex * 9}>
            <div
              style={{
                marginTop: lineIndex === 0 ? 24 : 2,
                color: lineIndex === 2 ? MINT : "white",
                fontSize: portrait ? 88 : 94,
                fontWeight: 700,
                letterSpacing: "-0.055em",
                lineHeight: 0.98,
              }}
            >
              {line}
            </div>
          </Reveal>
        ))}
      </div>
    </GreenStage>
  );
};

const SceneRenderer: React.FC<{
  scene: Scene;
  index: number;
  total: number;
}> = ({scene, index, total}) => {
  switch (scene.id) {
    case "juste-donne-envie":
      return <IntroScene index={index} total={total} />;
    case "produit-sans-ventes":
      return <ProblemScene index={index} total={total} />;
    case "demaa-systeme":
      return <SystemScene index={index} total={total} />;
    case "attirer-contenu-signature":
      return <SignatureScene index={index} total={total} />;
    case "attirer-ecosysteme":
      return <ContentSystemScene index={index} total={total} />;
    case "attirer-amplifier":
      return <AdsScene index={index} total={total} />;
    case "transformer-offre":
      return <EconomicsScene index={index} total={total} />;
    case "fideliser-relation":
      return <LoyaltyScene index={index} total={total} />;
    case "tenir-dans-la-duree":
      return <ClosingScene index={index} total={total} />;
    default:
      return <SystemScene index={index} total={total} />;
  }
};

export const getJusteDuration = (pilot: Pilot, variant: Variant) => {
  const seconds =
    variant === "master"
      ? pilot.scenes.reduce((sum, scene) => sum + scene.targetSeconds, 0)
      : shortClips[variant].reduce((sum, clip) => sum + clip.seconds, 0);
  return Math.round(seconds * pilot.format.fps);
};

export const JusteCaseVideo: React.FC<{
  pilot: Pilot;
  variant?: Variant;
  withAudio?: boolean;
  audioFile?: string;
}> = ({
  pilot,
  variant = "master",
  withAudio = false,
  audioFile = "courses/juste-systeme-marketing/audio/narration.mp3",
}) => {
  const clips: Clip[] =
    variant === "master"
      ? pilot.scenes.map((scene) => ({
          sceneId: scene.id,
          seconds: scene.targetSeconds,
        }))
      : shortClips[variant];

  const selected = clips.map((clip) => {
    const scene = pilot.scenes.find((item) => item.id === clip.sceneId);
    if (!scene) {
      throw new Error(`Scène JUSTE introuvable : ${clip.sceneId}`);
    }
    return {clip, scene};
  });

  return (
    <AbsoluteFill style={{background: GREEN}}>
      {withAudio ? <Audio src={staticFile(audioFile)} /> : null}
      <Series>
        {selected.map(({clip, scene}, index) => (
          <Series.Sequence
            key={`${variant}-${scene.id}`}
            durationInFrames={Math.round(clip.seconds * pilot.format.fps)}
            name={scene.title}
          >
            <SceneRenderer scene={scene} index={index} total={selected.length} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
