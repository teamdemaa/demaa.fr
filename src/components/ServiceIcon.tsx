import {
  Ban,
  Building2,
  Calculator,
  FilePenLine,
  FileSearch,
  Laptop,
  Music,
  Search,
  Share2,
  Target,
  TrendingUp,
  UserRoundCheck,
  Video,
  Workflow,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

const serviceIcons = {
  Ban,
  Building2,
  Calculator,
  FilePenLine,
  FileSearch,
  Laptop,
  Music,
  Search,
  Share2,
  Target,
  TrendingUp,
  UserRoundCheck,
  Video,
  Workflow,
};

export function ServiceIcon({
  icon,
  ...props
}: LucideProps & { icon: string }) {
  return createElement(serviceIcons[icon as keyof typeof serviceIcons] ?? Workflow, props);
}
