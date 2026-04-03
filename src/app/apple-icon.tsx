import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icône « D. » pour Apple Touch / écran d’accueil. */
export default function AppleIcon() {
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
          fontSize: 112,
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
