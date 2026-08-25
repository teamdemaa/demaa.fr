import {
  Building2,
  CarFront,
  CookingPot,
  CreditCard,
  HandHelping,
  HeartPulse,
  Home,
  Stethoscope,
} from "lucide-react";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";

const dailySolutions = [
  { name: "Wecasa", href: "https://www.wecasa.fr/", tag: "Déléguer", description: "Déléguez le ménage, la garde d’enfants et certains services du quotidien.", Icon: Home },
  { name: "Yoojo", href: "https://yoojo.fr/tous-les-services", tag: "Déléguer", description: "Trouvez rapidement de l’aide pour un petit travail, un déménagement ou un imprévu.", Icon: HandHelping },
  { name: "Jow", href: "https://jow.com/fr", tag: "Charge mentale", description: "Planifiez vos repas et préparez vos courses en quelques minutes.", Icon: CookingPot },
  { name: "Qare", href: "https://www.qare.fr/", tag: "Se préserver", description: "Consultez à distance quand vous ne pouvez pas libérer une demi-journée.", Icon: Stethoscope },
  { name: "Ulys Pro", href: "https://ulys.com/professionnel/les-offres-telepeage-ulys/", tag: "Se déplacer", description: "Regroupez péages, parkings et justificatifs sur une seule facture.", Icon: CarFront },
  { name: "Wojo", href: "https://www.wojo.com/fr-FR", tag: "Se déplacer", description: "Réservez ponctuellement un bureau ou une salle de réunion.", Icon: Building2 },
  { name: "American Express Business", href: "https://www.americanexpress.com/fr-fr/professionnel/cartes-pro/business-gold/index.html", tag: "Se déplacer", description: "Centralisez vos dépenses professionnelles et vos justificatifs de déplacement.", Icon: CreditCard },
  { name: "Amarok e-Santé", href: "https://sante-dirigeant.fr/", tag: "Se préserver", description: "Évaluez votre niveau de stress avant que l’épuisement ne s’installe.", Icon: HeartPulse },
] as const;

export default function LeaderDailyRail() {
  return (
    <section aria-labelledby="leader-daily-heading" className="border-t border-dema-line pt-10">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-muted">
        Le quotidien du dirigeant
      </p>
      <h2 id="leader-daily-heading" className="mt-3 text-2xl font-light tracking-[-0.035em] text-brand-blue sm:text-3xl">
        Simplifier aussi votre quotidien
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted sm:text-base">
        Une sélection de solutions pour déléguer certaines contraintes, faciliter vos déplacements et préserver votre énergie.
      </p>

      <HorizontalScrollHint
        className="-mx-4 mt-6 overflow-x-auto px-4 pb-3 soft-scroll sm:-mx-6 sm:px-6"
        controlsClassName="absolute right-0 -top-12 z-10 flex items-center gap-1.5"
      >
        <div className="flex gap-3">
          {dailySolutions.map(({ name, href, tag, description, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-56 w-[72vw] max-w-[14rem] shrink-0 flex-col rounded-[1.15rem] border border-dema-line bg-dema-paper p-4 transition hover:border-dema-forest/24 hover:shadow-[0_12px_30px_rgba(23,35,29,0.06)] sm:w-56"
              aria-label={`Découvrir ${name}, nouvelle fenêtre`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="mt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-dema-muted">{tag}</span>
              <strong className="mt-2 text-base font-medium leading-tight text-brand-blue">{name}</strong>
              <span className="mt-2 text-xs leading-5 text-dema-muted">{description}</span>
            </a>
          ))}
        </div>
      </HorizontalScrollHint>
      <p className="mt-3 text-xs leading-5 text-dema-muted">
        Sélection éditoriale, sans classement ni notation.
      </p>
    </section>
  );
}
