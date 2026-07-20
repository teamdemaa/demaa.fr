import { ImageResponse } from "next/og";

export const brandImageBackground = "#fafafa";
export const brandImageGreen = "#315f46";
export const brandImageText = "#17231d";
export const brandImageMuted = "#6f756e";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const logoImageSize = {
  width: 1200,
  height: 630,
};

export const brandImageContentType = "image/png";

export async function buildLogoImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brandImageBackground,
          color: brandImageGreen,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 220,
            fontStyle: "italic",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          Demaa
        </span>
      </div>
    ),
    {
      ...logoImageSize,
    }
  );
}

export async function buildSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "58px 64px 68px",
          background: brandImageBackground,
          color: brandImageText,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            alignItems: "center",
            maxWidth: "940px",
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 96,
              lineHeight: 0.98,
              fontStyle: "italic",
              letterSpacing: "-0.06em",
              color: brandImageGreen,
            }}
          >
            Structurez efficacement
          </span>
          <span
            style={{
              fontSize: 98,
              lineHeight: 0.98,
              fontWeight: 300,
              letterSpacing: "-0.06em",
              color: brandImageText,
            }}
          >
            votre entreprise
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "34px",
            maxWidth: "760px",
          }}
        >
          <span
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: brandImageMuted,
            }}
          >
            Pour que tout ne repose plus uniquement sur vous, mettez en place les
            bons process et creez les conditions d&apos;une croissance durable.
          </span>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
    }
  );
}
