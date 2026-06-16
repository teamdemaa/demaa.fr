import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon monogramme Demaa sur fond creme. */
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
          background: "#fafafa",
          color: "#315f46",
          fontSize: 22,
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
