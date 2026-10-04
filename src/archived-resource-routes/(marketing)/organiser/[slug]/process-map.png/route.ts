import renderOrganiserOpenGraphImage from "../opengraph-image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return renderOrganiserOpenGraphImage({ params });
}
