import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icône Apple monogramme Demaa sur fond creme. */
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
          background: "#fafafa",
          color: "#315f46",
          fontSize: 124,
          fontStyle: "italic",
          fontWeight: 400,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.08em",
        }}
      >
        D
      </div>
    ),
    { ...size }
  );
}
