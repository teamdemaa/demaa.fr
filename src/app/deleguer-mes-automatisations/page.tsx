import Navbar from "@/components/Navbar";
import DelegationPricingModal from "@/components/DelegationPricingModal";

export default function DeleguerMesAutomatisationsPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F8]">
      <Navbar />
      <main className="pt-4 md:pt-6">
        <DelegationPricingModal embedded />
      </main>
    </div>
  );
}
