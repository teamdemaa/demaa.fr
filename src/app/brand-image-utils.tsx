import { ImageResponse } from "next/og";

const brandImageBackground = "#fbfcfe";
const brandImageBlue = "#244a68";
const brandImageText = "#17283e";
const brandImageMuted = "#627181";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const brandImageContentType = "image/png";

export function buildSiniIcon(width: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: Math.round(width * 0.28),
          background: brandImageBlue,
          color: brandImageBackground,
          fontFamily: "Arial, sans-serif",
          fontSize: Math.round(width * 0.68),
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        s
      </div>
    ),
    { width, height: width },
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
          <span style={{ fontSize: 48, letterSpacing: "0.18em", color: brandImageBlue }}>
            sini
          </span>
          <span
            style={{
              fontSize: 86,
              lineHeight: 1.05,
              fontWeight: 300,
              letterSpacing: "-0.055em",
              color: brandImageText,
            }}
          >
            Reprendre. Vendre.
          </span>
          <span style={{ fontSize: 70, lineHeight: 1.1, fontWeight: 300, letterSpacing: "-0.05em", color: brandImageBlue }}>
            Préparer la suite.
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
            Des entreprises à reprendre et des méthodes pour préparer leur transmission.
          </span>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
    }
  );
}
