import { buildSiniIcon, brandImageContentType } from "@/app/brand-image-utils";

export const size = { width: 32, height: 32 };
export const contentType = brandImageContentType;

export default function Icon() {
  return buildSiniIcon(size.width);
}
