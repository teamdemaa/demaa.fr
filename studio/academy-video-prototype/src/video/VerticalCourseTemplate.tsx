import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DEMAA_GREEN = "#315F46";
const DEMAA_CREAM = "#F4EDDF";
const JUSTE_CACAO = "#2B1914";
const JUSTE_YELLOW = "#F2BC52";

export const VERTICAL_TEMPLATE_GEOMETRY = {
  canvasWidth: 1080,
  canvasHeight: 1920,
  frameLeft: 40,
  frameTop: 590,
  frameWidth: 1000,
  frameHeight: 750,
  frameRadius: 26,
  frameBorder: 2,
  signatureTop: 162,
  captionTop: 1400,
} as const;

type FrameShellProps = {
  background: string;
  borderColor: string;
  captionColor: string;
  captionLines: [string, string];
  children: React.ReactNode;
  frameBackground: string;
  signatureColor: string;
};

const FrameShell: React.FC<FrameShellProps> = ({
  background,
  borderColor,
  captionColor,
  captionLines,
  children,
  frameBackground,
  signatureColor,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: {damping: 24, stiffness: 95, mass: 0.9},
    durationInFrames: 36,
  });
  const frameOffset = interpolate(entrance, [0, 1], [18, 0]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background,
        color: captionColor,
        fontFamily: '"Satoshi", "Avenir Next", Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: VERTICAL_TEMPLATE_GEOMETRY.signatureTop,
          right: 0,
          left: 0,
          color: signatureColor,
          fontFamily: '"Gambetta", Georgia, serif',
          fontSize: 64,
          fontStyle: "italic",
          fontWeight: 300,
          fontSynthesis: "none",
          letterSpacing: "-0.035em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        Demaa
      </div>

      <div
        data-vertical-content-frame
        style={{
          position: "absolute",
          top: VERTICAL_TEMPLATE_GEOMETRY.frameTop,
          left: VERTICAL_TEMPLATE_GEOMETRY.frameLeft,
          width: VERTICAL_TEMPLATE_GEOMETRY.frameWidth,
          height: VERTICAL_TEMPLATE_GEOMETRY.frameHeight,
          overflow: "hidden",
          transform: `translateY(${frameOffset}px)`,
          border: `${VERTICAL_TEMPLATE_GEOMETRY.frameBorder}px solid ${borderColor}`,
          borderRadius: VERTICAL_TEMPLATE_GEOMETRY.frameRadius,
          background: frameBackground,
        }}
      >
        {children}
      </div>

      <div
        data-vertical-caption
        style={{
          position: "absolute",
          top: VERTICAL_TEMPLATE_GEOMETRY.captionTop,
          left: VERTICAL_TEMPLATE_GEOMETRY.frameLeft,
          width: VERTICAL_TEMPLATE_GEOMETRY.frameWidth,
          color: captionColor,
          fontFamily: '"Satoshi", "Avenir Next", Arial, sans-serif',
          fontSize: 35,
          fontWeight: 400,
          fontSynthesis: "none",
          letterSpacing: "-0.018em",
          lineHeight: 1.28,
          textAlign: "center",
        }}
      >
        <div>{captionLines[0]}</div>
        <div>{captionLines[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

export const AcademyVerticalCourseTemplate: React.FC = () => {
  const frame = useCurrentFrame();
  const illustrationScale = interpolate(frame, [0, 90], [0.985, 1.015], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <FrameShell
      background={DEMAA_GREEN}
      borderColor={DEMAA_CREAM}
      captionColor={DEMAA_CREAM}
      captionLines={[
        "Le chiffre d’affaires mesure les ventes.",
        "Le bénéfice mesure ce qu’il reste.",
      ]}
      frameBackground={DEMAA_GREEN}
      signatureColor={DEMAA_CREAM}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateColumns: "0.92fr 1.08fr",
          alignItems: "center",
          gap: 26,
          padding: "54px 48px",
        }}
      >
        <div style={{minWidth: 0}}>
          <div
            style={{
              color: DEMAA_CREAM,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Les essentiels
          </div>
          <div
            style={{
              marginTop: 52,
              color: DEMAA_CREAM,
              fontSize: 66,
              fontWeight: 400,
              letterSpacing: "-0.045em",
              lineHeight: 1.08,
            }}
          >
            Vendre plus
            <br />
            ne veut pas dire
            <br />
            gagner plus.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            minWidth: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={staticFile(
              "illustrations/02_benefice_cash_retard.png",
            )}
            style={{
              display: "block",
              width: "100%",
              height: 570,
              transform: `scale(${illustrationScale})`,
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </FrameShell>
  );
};

export const JusteVerticalCaseTemplate: React.FC = () => {
  const frame = useCurrentFrame();
  const photoScale = interpolate(frame, [0, 120], [1.01, 1.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <FrameShell
      background={DEMAA_CREAM}
      borderColor={JUSTE_CACAO}
      captionColor={JUSTE_CACAO}
      captionLines={["Secteur : Food.", "Modèle : E-commerce."]}
      frameBackground={DEMAA_CREAM}
      signatureColor={JUSTE_CACAO}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateColumns: "1.08fr 0.92fr",
          background: DEMAA_CREAM,
        }}
      >
        <div style={{minWidth: 0, overflow: "hidden"}}>
          <Img
            src={staticFile(
              "courses/juste-systeme-marketing/images/07-brand-reveal-juste.png",
            )}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              transform: `scale(${photoScale})`,
              objectFit: "cover",
              objectPosition: "50% 43%",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            minWidth: 0,
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 42px",
            color: JUSTE_CACAO,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Cas concret
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 42,
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 0.95,
            }}
          >
            JUSTE
            <span style={{color: JUSTE_YELLOW}}>.</span>
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 43,
              fontWeight: 400,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
            }}
          >
            Une marque gourmande.
            <br />
            Un système qui doit vendre.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 44,
            }}
          >
            {["Food", "E-commerce"].map((sector) => (
              <div
                key={sector}
                style={{
                  padding: "10px 16px 11px",
                  border: `2px solid ${JUSTE_CACAO}`,
                  borderRadius: 999,
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {sector}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FrameShell>
  );
};
