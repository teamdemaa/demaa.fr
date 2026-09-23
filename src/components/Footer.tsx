import MarketingFooterSwitcher from "@/components/MarketingFooterSwitcher";
import { isGuestProductEnabled } from "@/lib/guest-action-plan-security.server";

export default function Footer() {
  const showCustomerLogin = !isGuestProductEnabled();
  return <MarketingFooterSwitcher showCustomerLogin={showCustomerLogin} />;
}
