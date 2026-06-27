import { getDemaaServices } from "@/lib/service-catalog";

export function getDelegationServices() {
  const hiddenSlugs = new Set([
    "recrutement-assistante-facturation",
    "organisation-automatisation",
    "creation-societe",
    "modification-societe",
    "fermeture-societe",
    "expert-comptable",
    "publicite-google",
    "publicite-facebook-instagram",
    "publicite-tiktok",
    "montage-video",
  ]);

  const pinnedOrder = [
    "assistante-facturation",
    "site-web",
    "previsionnel-financier",
  ];

  const services = getDemaaServices().filter((service) => !hiddenSlugs.has(service.slug));

  return services.sort((left, right) => {
    const leftIndex = pinnedOrder.indexOf(left.slug);
    const rightIndex = pinnedOrder.indexOf(right.slug);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}
