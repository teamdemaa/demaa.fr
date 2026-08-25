import { ImageResponse } from "next/og";
import { getAcademyContentBySlug } from "@/lib/academy-course-content";

export const alt = "Carte d’un processus Demaa en six étapes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fallbackSteps = [
  "Point de départ",
  "Notion principale",
  "Décision utile",
  "Mise en pratique",
  "Point de contrôle",
  "Prochaine action",
];

function StepCard({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#FFFFFF",
        border: "2px solid #C7D4CB",
        borderRadius: 24,
        color: "#2D3B33",
        display: "flex",
        fontSize: 27,
        fontWeight: 600,
        height: 158,
        justifyContent: "center",
        lineHeight: 1.2,
        padding: "22px 28px",
        textAlign: "center",
        width: 292,
      }}
    >
      {label}
    </div>
  );
}

function HorizontalArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <div
      style={{
        alignItems: "center",
        color: "#789987",
        display: "flex",
        fontSize: 46,
        justifyContent: "center",
        width: 62,
      }}
    >
      {direction === "right" ? "→" : "←"}
    </div>
  );
}

export default async function AcademyOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getAcademyContentBySlug(slug);
  const steps = content?.processGuide?.steps.map((step) => step.label) ?? fallbackSteps;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#FBFCFA",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#F0F4F1",
            border: "2px solid #E1E8E3",
            borderRadius: 38,
            display: "flex",
            flexDirection: "column",
            height: 550,
            justifyContent: "center",
            padding: "38px 54px",
            width: 1120,
          }}
        >
          <div style={{ alignItems: "center", display: "flex", width: "100%" }}>
            <StepCard label={steps[0]} />
            <HorizontalArrow direction="right" />
            <StepCard label={steps[1]} />
            <HorizontalArrow direction="right" />
            <StepCard label={steps[2]} />
          </div>

          <div
            style={{
              color: "#789987",
              display: "flex",
              fontSize: 46,
              height: 68,
              justifyContent: "flex-end",
              paddingRight: 130,
              width: "100%",
            }}
          >
            ↓
          </div>

          <div style={{ alignItems: "center", display: "flex", width: "100%" }}>
            <StepCard label={steps[5]} />
            <HorizontalArrow direction="left" />
            <StepCard label={steps[4]} />
            <HorizontalArrow direction="left" />
            <StepCard label={steps[3]} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
