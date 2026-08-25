import renderAcademyOpenGraphImage from "../opengraph-image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return renderAcademyOpenGraphImage({ params });
}
