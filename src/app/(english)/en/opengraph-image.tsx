import {
  buildSocialImage,
  brandImageContentType,
  socialImageSize,
} from "@/app/brand-image-utils";
import { ENGLISH_BETA_SOCIAL_IMAGE_ALT } from "@/lib/english-beta-metadata";

export const alt = ENGLISH_BETA_SOCIAL_IMAGE_ALT;
export const size = socialImageSize;
export const contentType = brandImageContentType;

export default async function OpenGraphImage() {
  return buildSocialImage();
}
