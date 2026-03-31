import Navbar from "@/components/Navbar";
import ServiceRow from "@/components/ServiceRow";
import { ServiceRecord } from "@/lib/data";

const toolsData: ServiceRecord[] = [
  { id: "t1", slug: "generation-de-document", name: "Génération de document", category: "Automatisation", description: "Générez vos documents professionnels automatiquement sans perdre de temps.", shortDescription: "Documents prêts à l'emploi", tags: ["Doc", "Auto"], icon: "FileText", price: "Gratuit" },
  { id: "t2", slug: "generation-de-qr-code-pour-card", name: "Génération de QR code pour card", category: "Outils visuels", description: "Créez facilement des QR codes optimisés pour vos cartes de visite.", shortDescription: "Pour carte de visite", tags: ["QR", "Card"], icon: "QrCode", price: "Gratuit" },
  { id: "t3", slug: "generation-de-tampon", name: "Génération de Tampon", category: "Outils visuels", description: "Un outil pour concevoir et générer votre tampon d'entreprise virtuel personnalisé.", shortDescription: "Créez votre tampon", tags: ["Design", "Admin"], icon: "Stamp", price: "Gratuit" },
  { id: "t4", slug: "qr-code-pour-avis-client", name: "QR code pour avis client", category: "Marketing", description: "Incitez vos clients à laisser un avis positif avec ce QR code magique.", shortDescription: "Collecte d'avis", tags: ["Avis", "QR"], icon: "Star", price: "Gratuit" },
  { id: "t5", slug: "creation-de-fiche-google-optimisee", name: "Création de fiche Google", category: "Marketing", description: "Optimisez votre référencement local grâce à une fiche Google parfaitement remplie.", shortDescription: "Boostez votre SEO local", tags: ["Google", "SEO"], icon: "MapPin", price: "Gratuit" },
  { id: "t6", slug: "signature-email-pro", name: "Signature email pro", category: "Outils visuels", description: "Générez une signature mail esthétique et responsive pour toute votre équipe.", shortDescription: "Emails premium", tags: ["Email", "Pro"], icon: "MailSignature", price: "Gratuit" },
  { id: "t7", slug: "qr-code-commande-rapide", name: "QR code commande rapide", category: "Vente", description: "Facilitez la commande de vos produits grâce à un QR code menant directement au paiement.", shortDescription: "Vente express", tags: ["Vente", "QR"], icon: "ShoppingCart", price: "Gratuit" },
  { id: "t8", slug: "signez-un-document-electroniquement", name: "Signez un document", category: "Juridique", description: "Apposez votre signature électronique sur n'importe quel contrat PDF.", shortDescription: "e-Signature légale", tags: ["Signature", "PDF"], icon: "PenTool", price: "Gratuit" },
  { id: "t9", slug: "generation-de-menu-avec-qr-code", name: "Génération menu QR code", category: "Automatisation", description: "Transformez votre carte de restaurant en menu digital scannable.", shortDescription: "Menu sans contact", tags: ["Restaurant", "QR"], icon: "Utensils", price: "Gratuit" },
  { id: "t10", slug: "generation-de-qr-code", name: "Génération de QR code", category: "Outils visuels", description: "Créez un simple QR code pointant vers l'URL de votre choix.", shortDescription: "QR code simple", tags: ["QR", "Lien"], icon: "Link", price: "Gratuit" }
];

export const metadata = {
  title: "Annuaire des Outils Gratuits - Demaa",
  description: "Découvrez notre collection d'outils gratuits indispensables pour simplifier votre quotidien d'entrepreneur."
};

import ServiceCard from "@/components/ServiceCard";

// (Previous tool definitions skipped logic relies on top part, I will just replace the rendering logic)

export default function ToolsDirectoryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen pb-20">
        <section className="w-full flex flex-col items-center justify-center pt-8 pb-8 md:pt-10 md:pb-8 px-4 text-center bg-[#FFF9F8] border-b border-brand-coral/10">
          <h1 className="text-2xl md:text-4xl lg:text-4xl font-bold tracking-tight text-brand-blue mb-3 leading-tight max-w-4xl mx-auto z-10 relative">
            L'annuaire des <span className="text-brand-coral">outils gratuits</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium">
            Une sélection d'outils ultra-simples et gratuits pour faciliter la gestion de votre entreprise au quotidien.
          </p>
        </section>

        <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolsData.map(tool => (
              <ServiceCard 
                 key={tool.id} 
                 service={tool} 
                 fullWidth 
                 baseUrl="/outils" 
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
