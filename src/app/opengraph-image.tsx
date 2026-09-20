import { buildSocialImage, brandImageContentType, socialImageSize } from "@/app/brand-image-utils";

export const alt = "sini — reprendre, vendre et préparer la suite d’une entreprise";
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
