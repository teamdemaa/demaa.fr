"use client";

import { usePathname } from "next/navigation";
import DemaaFooter from "@/components/DemaaFooter";
import LegacyFooter from "@/components/LegacyFooter";
import { usesDemaaFooter } from "@/lib/demaa-footer-routes";

export default function MarketingFooterSwitcher({ showCustomerLogin }: { showCustomerLogin: boolean }) {
  const pathname = usePathname();
  return usesDemaaFooter(pathname)
    ? <DemaaFooter />
    : <LegacyFooter showCustomerLogin={showCustomerLogin} />;
}
