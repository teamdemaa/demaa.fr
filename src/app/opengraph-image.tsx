import { buildSocialImage, brandImageContentType, socialImageSize } from "@/app/brand-image-utils";

export const alt = "Demaa — Studio d’entreprises";
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
