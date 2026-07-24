import { buildSocialImage, brandImageContentType, socialImageSize } from "@/app/brand-image-utils";

export const alt = "Demaa structure votre entreprise pour qu’elle fonctionne sans vous";
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
