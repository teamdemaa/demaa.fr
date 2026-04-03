import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon « D. » comme le logo (bleu + point corail). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF9F8",
          fontWeight: 700,
          fontSize: 20,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: "-0.05em",
        }}
      >
        <span style={{ color: "#191b30" }}>D</span>
        <span style={{ color: "#f39d66" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
