import { buildSocialImage, brandImageContentType, socialImageSize } from "@/app/brand-image-utils";

export const alt = "Structurez votre entreprise pour qu’elle dépende moins de vous";
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
