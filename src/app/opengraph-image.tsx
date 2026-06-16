import { buildSocialImage, brandImageContentType, socialImageSize } from "@/app/brand-image-utils";

export const alt = "Carte Demaa pour analyser son organisation";
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
