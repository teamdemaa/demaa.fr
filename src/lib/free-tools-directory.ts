import { toolsData } from "@/lib/data";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

export const freeToolsDirectorySectors = [
  "Tous",
  "Services & conseil",
  "Commerce local",
  "Restauration",
  "Artisanat & BTP",
  "Santé & bien-être",
  "Immobilier",
];

export const freeToolsDirectoryCategories = [
  "Tous",
  "Organisation & IA",
  "QR Code",
  "Visibilité locale",
  "Signature & documents",
  "Identité & admin",
];

const customFreeTools: ToolDirectoryItem[] = [];

const freeToolMappings: Record<
  string,
  { category: string; sectors: string[]; bestFor: string; tags?: string[] }
> = {
  "generation-de-qr-code": {
    category: "QR Code",
    sectors: ["Services & conseil", "Commerce local", "Restauration", "Artisanat & BTP", "Immobilier"],
    bestFor: "Créer un QR code simple pour un lien, une page ou un support imprimé.",
    tags: ["QR", "Lien"],
  },
  "carte-de-visite-qr-code-whatsapp": {
    category: "QR Code",
    sectors: ["Services & conseil", "Commerce local", "Immobilier"],
    bestFor: "Partager un contact WhatsApp plus vite depuis une carte de visite.",
    tags: ["QR", "WhatsApp", "Carte de visite"],
  },
  "qr-code-pour-avis-client": {
    category: "Visibilité locale",
    sectors: ["Commerce local", "Restauration", "Artisanat & BTP", "Santé & bien-être"],
    bestFor: "Envoyer vos clients vers une page d'avis en un scan.",
    tags: ["Avis", "Google", "QR"],
  },
  "qr-code-commande-rapide": {
    category: "QR Code",
    sectors: ["Commerce local", "Restauration"],
    bestFor: "Faciliter une commande ou un paiement rapide depuis un support physique.",
    tags: ["Commande", "Paiement", "QR"],
  },
  "generation-de-menu-qr-code": {
    category: "QR Code",
    sectors: ["Restauration"],
    bestFor: "Afficher un menu digital clair en salle ou en terrasse.",
    tags: ["Restaurant", "Menu", "QR"],
  },
  "creation-de-fiche-google-optimisee": {
    category: "Visibilité locale",
    sectors: ["Commerce local", "Restauration", "Artisanat & BTP", "Immobilier", "Santé & bien-être"],
    bestFor: "Mieux apparaître dans Google Maps et en recherche locale.",
    tags: ["Google", "SEO local", "Visibilité"],
  },
  "generation-de-tampon": {
    category: "Identité & admin",
    sectors: ["Services & conseil", "Artisanat & BTP", "Immobilier"],
    bestFor: "Créer un tampon visuel pour vos documents et supports administratifs.",
    tags: ["Tampon", "Admin", "Document"],
  },
  "signature-pro": {
    category: "Signature & documents",
    sectors: ["Services & conseil", "Immobilier", "Artisanat & BTP"],
    bestFor: "Uniformiser les signatures email de l'équipe.",
    tags: ["Email", "Signature", "Image de marque"],
  },
  "signez-un-document-electroniquement": {
    category: "Signature & documents",
    sectors: ["Services & conseil", "Immobilier", "Artisanat & BTP"],
    bestFor: "Faire signer un document rapidement sans outil complexe.",
    tags: ["Signature", "PDF", "Document"],
  },
};

export const freeToolsDirectory: ToolDirectoryItem[] = [
  ...customFreeTools,
  ...toolsData
    .filter((tool) => tool.price === "Gratuit")
    .map((tool) => {
      const mapped = freeToolMappings[tool.slug];

      return {
        name: tool.name,
        url: `/outils/${tool.slug}`,
        category: mapped?.category ?? "Identité & admin",
        sectors: mapped?.sectors ?? ["Services & conseil"],
        description: tool.description,
        tags: mapped?.tags ?? tool.tags,
        bestFor: mapped?.bestFor ?? tool.shortDescription ?? tool.description,
        pricingHint: "Gratuit",
      };
    }),
];
