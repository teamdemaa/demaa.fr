import DemaaFooter from "@/components/DemaaFooter";

// Archived pages deliberately keep the current footer. This component is
// retained only for old imports while the legacy marketplace is archived.
export default function LegacyFooter(_: { showCustomerLogin: boolean }) {
  return <DemaaFooter />;
}
