import {
  Aperture,
  BadgeCheck,
  BookOpenCheck,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Camera,
  Car,
  ChefHat,
  Cloud,
  Code2,
  ClipboardCheck,
  Cpu,
  Dumbbell,
  Factory,
  FileText,
  Flower2,
  Gavel,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Headphones,
  Home,
  KeyRound,
  Landmark,
  Layers,
  Megaphone,
  Navigation,
  Newspaper,
  PartyPopper,
  PenTool,
  Scissors,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { System } from "@/lib/types";

const systemIcons: Record<string, LucideIcon> = {
  Aperture,
  Box,
  Briefcase: BriefcaseBusiness,
  Building2,
  Calculator,
  Camera,
  Car,
  ChefHat,
  Cloud,
  Code: Code2,
  ClipboardCheck,
  Cpu,
  Croissant: Store,
  Dolly: Truck,
  Dumbbell,
  Factory,
  FileCheck2: BookOpenCheck,
  FileText,
  Flower2,
  Gavel,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Headphones,
  Home,
  Key: KeyRound,
  Landmark,
  Laptop: BriefcaseBusiness,
  Layers,
  Megaphone,
  Navigation,
  Newspaper,
  PartyPopper,
  PenTool,
  Scissors,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Utensils: ChefHat,
  Video,
  Wrench,
};

const activityIcons: Record<string, LucideIcon> = {
  "cabinet-comptable": Calculator,
  "cabinet-d-avocat": Gavel,
  "cabinet-de-conseil": BriefcaseBusiness,
  "agence-marketing": Megaphone,
  freelance: BriefcaseBusiness,
  "agence-de-recrutement": UserCheck,
  "agence-web": Code2,
  "creation-de-contenu": Camera,
  saas: Cloud,
  "maintenance-informatique": Cpu,
  btp: Building2,
  artisanat: Hammer,
  "agence-immobiliere": Home,
  "investissement-locatif": Landmark,
  "gestion-patrimoine": Landmark,
  "courtier-assurance": Shield,
  demenagement: Truck,
  "livraison-dernier-kilometre": Navigation,
  "transport-de-marchandise": Box,
  "transport-de-personnes": Car,
  restaurant: ChefHat,
  boulangerie: Store,
  traiteur: ChefHat,
  "commerce-de-detail": Store,
  "e-commerce": ShoppingBag,
  "institut-de-beaute": Flower2,
  "salon-de-coiffure": Scissors,
  "salle-de-sport": Dumbbell,
  "services-a-la-personne": HeartHandshake,
  "formation-en-ligne": GraduationCap,
  "organisme-de-formation": BookOpenCheck,
  evenementiel: PartyPopper,
  "photographe-videaste": Aperture,
  media: Newspaper,
  "nettoyage-professionnel": Sparkles,
  "reparation-telephonique": Smartphone,
  "garage-automobile": Wrench,
  marketplace: Layers,
  "location-de-materiel": ClipboardCheck,
  "securite-privee": Shield,
  "industrie-production": Factory,
};

export function getSystemIcon(system: System): LucideIcon {
  const slugIcon = activityIcons[system.slug];

  if (slugIcon) return slugIcon;

  const normalizedName = system.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedName.includes("comptable")) return Calculator;
  if (normalizedName.includes("avocat")) return Gavel;
  if (normalizedName.includes("marketing")) return Megaphone;
  if (normalizedName.includes("recrutement")) return UserCheck;
  if (normalizedName.includes("web")) return Code2;
  if (normalizedName.includes("contenu")) return Camera;
  if (normalizedName.includes("formation")) return GraduationCap;
  if (normalizedName.includes("restaurant")) return ChefHat;
  if (normalizedName.includes("coiffure")) return Scissors;
  if (normalizedName.includes("beaute")) return Flower2;
  if (normalizedName.includes("transport")) return Truck;
  if (normalizedName.includes("immobilier")) return Home;
  if (normalizedName.includes("patrimoine")) return Landmark;

  return systemIcons[system.icon] ?? BadgeCheck;
}
