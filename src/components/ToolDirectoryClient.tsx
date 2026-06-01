"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

function getValidFilters(
  sectors: string[],
  categories: string[],
  sector?: string,
  category?: string,
) {
  if (category && categories.includes(category)) {
    return { sector: "Tous", category };
  }

  if (sector && sectors.includes(sector)) {
    return { sector, category: "Tous" };
  }

  return { sector: "Tous", category: "Tous" };
}

type ToolDirectoryClientProps = {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  resultLabel?: string;
  items: ToolDirectoryItem[];
  sectors: string[];
  categories: string[];
  initialCategory?: string;
  initialSector?: string;
  hideTransverseOnSector?: boolean;
  externalLinks?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  showHeader?: boolean;
  showSearchBar?: boolean;
  variant?: "directory" | "toolbox";
};

const otherTools: ToolDirectoryItem[] = [
  {
    name: "Tiimora",
    url: "https://tiimora.com/",
    category: "Cabinet comptable",
    sectors: ["Cabinet comptable"],
    description: "Un outil métier pensé pour structurer les cabinets comptables.",
    tags: ["Comptabilité", "Cabinet", "Métier"],
    bestFor: "Piloter les opérations et les processus d'un cabinet comptable.",
    pricingHint: "Métier",
  },
  {
    name: "Pennylane",
    url: "https://www.pennylane.com/",
    category: "Transverse",
    sectors: ["Transverse"],
    description: "Comptabilité, facturation et pilotage financier pour les entreprises.",
    tags: ["Comptabilité", "Finance", "Facturation"],
    bestFor: "Centraliser la gestion financière et comptable.",
    pricingHint: "Payant",
  },
  {
    name: "Obat",
    url: "https://www.obat.fr/",
    category: "BTP",
    sectors: ["BTP"],
    description: "Devis, factures et suivi commercial pour les professionnels du bâtiment.",
    tags: ["Devis", "Facture", "BTP"],
    bestFor: "Gérer les devis et la facturation d'une activité BTP.",
    pricingHint: "Payant",
  },
  {
    name: "Planity",
    url: "https://www.planity.com/",
    category: "Esthétique",
    sectors: ["Esthétique"],
    description: "Réservation en ligne et gestion d'agenda pour les métiers de la beauté.",
    tags: ["Agenda", "Réservation", "Beauté"],
    bestFor: "Remplir un planning et simplifier la prise de rendez-vous.",
    pricingHint: "Payant",
  },
  {
    name: "Dashdoc",
    url: "https://www.dashdoc.com/",
    category: "Transport",
    sectors: ["Transport"],
    description: "Gestion des opérations transport, documents et suivi de livraisons.",
    tags: ["Transport", "Planning", "Documents"],
    bestFor: "Structurer les flux et documents transport.",
    pricingHint: "Payant",
  },
  {
    name: "Square",
    url: "https://squareup.com/",
    category: "Caisse",
    sectors: ["Caisse"],
    description: "Solutions de caisse, paiement et gestion commerciale.",
    tags: ["Caisse", "Paiement", "Commerce"],
    bestFor: "Encaisser et suivre les ventes au quotidien.",
    pricingHint: "Payant",
  },
  {
    name: "Shopify",
    url: "https://www.shopify.com/",
    category: "E-commerce",
    sectors: ["E-commerce"],
    description: "Plateforme e-commerce pour vendre en ligne et gérer les commandes.",
    tags: ["Boutique", "Commande", "Vente en ligne"],
    bestFor: "Lancer et structurer une boutique en ligne.",
    pricingHint: "Payant",
  },
  {
    name: "Qonto",
    url: "https://qonto.com/",
    category: "Banque",
    sectors: ["Banque"],
    description: "Compte pro, cartes, virements et suivi des dépenses d'entreprise.",
    tags: ["Banque", "Compte pro", "Dépenses"],
    bestFor: "Gérer les finances courantes d'une entreprise.",
    pricingHint: "Payant",
  },
  {
    name: "Revolut",
    url: "https://www.revolut.com/business/",
    category: "Banque",
    sectors: ["Banque"],
    description: "Compte business, paiements internationaux et cartes d'équipe.",
    tags: ["Banque", "International", "Cartes"],
    bestFor: "Gérer les paiements et dépenses internationales.",
    pricingHint: "Payant",
  },
  {
    name: "Swile",
    url: "https://www.swile.co/",
    category: "Équipe",
    sectors: ["Équipe"],
    description: "Avantages salariés, titres-restaurants et expérience collaborateur.",
    tags: ["RH", "Avantages", "Équipe"],
    bestFor: "Structurer les avantages et dépenses d'équipe.",
    pricingHint: "Payant",
  },
  {
    name: "Alan",
    url: "https://alan.com/",
    category: "Mutuelle",
    sectors: ["Mutuelle"],
    description: "Mutuelle santé et services de prévention pour les équipes.",
    tags: ["Santé", "Mutuelle", "RH"],
    bestFor: "Mettre en place une couverture santé simple pour l'équipe.",
    pricingHint: "Payant",
  },
];

export default function ToolDirectoryClient({
  title = "Annuaire Logiciels",
  description = "Les principaux logiciels utiles aux TPE, classés par secteur et usage.",
  searchPlaceholder = "Rechercher un outil, un usage, un secteur...",
  resultLabel = "logiciels trouvés",
  items,
  sectors,
  categories,
  initialCategory,
  initialSector,
  hideTransverseOnSector = true,
  externalLinks = true,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  showHeader = true,
  showSearchBar = true,
  variant = "directory",
}: ToolDirectoryClientProps) {
  const initialFilters = getValidFilters(
    sectors,
    categories,
    initialSector,
    initialCategory,
  );
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState(initialFilters.sector);
  const [activeCategory, setActiveCategory] = useState(initialFilters.category);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;

  function updateSearchQuery(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  }

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((tool) => {
      const isTransverseTool = tool.sectors.length > 2;
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.bestFor.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.sectors.some((sector) => sector.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);

      const matchesSector =
        activeSector === "Tous" ||
        (tool.sectors.includes(activeSector) &&
          (!hideTransverseOnSector || !isTransverseTool));

      const matchesCategory =
        activeCategory === "Tous" || tool.category === activeCategory;

      return matchesSearch && matchesSector && matchesCategory;
    });
  }, [activeCategory, activeSector, hideTransverseOnSector, items, searchQuery]);

  const filteredOtherTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return otherTools.filter((tool) => {
      return (
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.bestFor.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.sectors.some((sector) => sector.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="w-full">
      <section className={`w-full border-b border-brand-blue/5 bg-[#FFF9F8] px-4 pb-5 ${showHeader ? "pt-8 md:pt-10" : "pt-0"}`}>
        <div className="mx-auto max-w-5xl text-center">
          {showHeader ? (
            <>
              <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-gray-600">
                {description}
              </p>
            </>
          ) : null}

          {showSearchBar ? (
            <div className={`mx-auto max-w-4xl rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(25,27,48,0.035)] ${showHeader ? "mt-5" : "mt-0"}`}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                <input
                  value={searchQuery}
                  onChange={(event) => updateSearchQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full bg-white py-3 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/40"
                />
              </div>
            </div>
          ) : null}

          {variant === "directory" ? (
            <div className={`mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-2 soft-scroll ${showSearchBar || showHeader ? "mt-3" : "mt-0"}`}>
              <FilterChip
                label="Tous"
                isActive={activeSector === "Tous" && activeCategory === "Tous"}
                onClick={() => {
                  setActiveSector("Tous");
                  setActiveCategory("Tous");
                }}
              />
              {sectors
                .filter((sector) => sector !== "Tous")
                .map((sector) => (
                  <FilterChip
                    key={sector}
                    label={sector}
                    isActive={activeSector === sector}
                    onClick={() => {
                      setActiveSector(sector);
                      setActiveCategory("Tous");
                    }}
                  />
                ))}
              {categories
                .filter((category) => category !== "Tous")
                .map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    isActive={activeCategory === category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveSector("Tous");
                    }}
                  />
                ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 md:py-7">
        <div className="flex items-center justify-end gap-4 pb-5">
          {(activeSector !== "Tous" || activeCategory !== "Tous" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                updateSearchQuery("");
                setActiveSector("Tous");
                setActiveCategory("Tous");
              }}
              className="text-xs font-medium text-brand-coral transition hover:text-brand-blue"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {variant === "toolbox" ? (
          <ToolboxSections
            freeTools={filteredTools}
            otherTools={filteredOtherTools}
            externalLinks={externalLinks}
          />
        ) : filteredTools.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-brand-blue/10 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun outil trouvé</h2>
            <p className="mt-3 text-sm font-normal text-gray-500">
              Essayez un autre secteur, une autre catégorie ou un mot-clé plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.name}
                externalLinks={externalLinks}
                href={tool.url}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-coral">
                      {tool.category}
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-brand-blue">
                      {tool.name}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm font-normal leading-relaxed text-gray-600">
                  {tool.description}
                </p>

                <p className="mt-2 text-xs font-normal leading-relaxed text-brand-blue/65">
                  {tool.bestFor}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(tool.sectors.length > 2 ? ["Transverse"] : tool.sectors)
                    .slice(0, 2)
                    .map((sector) => (
                      <span
                        key={sector}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-normal ${
                          sector === "Transverse"
                            ? "bg-brand-blue/5 text-brand-blue/65"
                            : "bg-[#FFF3EF] text-brand-blue/75"
                        }`}
                      >
                        {sector}
                      </span>
                    ))}
                  {tool.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#FFF3EF] px-2.5 py-1 text-[10px] font-normal text-brand-blue/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3">
                  <span className="inline-flex rounded-full bg-brand-blue px-3 py-1 text-[10px] font-medium text-white">
                    {tool.pricingHint}
                  </span>
                </div>
              </ToolCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ToolboxSections({
  freeTools,
  otherTools,
  externalLinks,
}: {
  freeTools: ToolDirectoryItem[];
  otherTools: ToolDirectoryItem[];
  externalLinks: boolean;
}) {
  const hasResults = freeTools.length > 0 || otherTools.length > 0;

  if (!hasResults) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-brand-blue/10 bg-white p-10 text-center">
        <h2 className="text-xl font-bold text-brand-blue">Aucun outil trouvé</h2>
        <p className="mt-3 text-sm font-normal text-gray-500">
          Essayez un autre mot-clé ou un usage plus large.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {freeTools.length > 0 ? (
        <section>
          <SectionTitle title="Outils Gratuits" />
          <div className="-mx-4 overflow-x-auto px-4 pb-3 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-4">
              {freeTools.map((tool) => (
                <SquareToolCard
                  key={tool.name}
                  tool={tool}
                  externalLinks={externalLinks}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {otherTools.length > 0 ? (
        <section>
          <SectionTitle title="Autres Outils" />
          <div className="-mx-4 overflow-x-auto px-4 pb-3 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-4">
              {otherTools.map((tool) => (
                <SquareToolCard
                  key={tool.name}
                  tool={tool}
                  externalLinks
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="demaa-section-title text-3xl tracking-tight text-brand-blue md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function SquareToolCard({
  tool,
  externalLinks,
}: {
  tool: ToolDirectoryItem;
  externalLinks: boolean;
}) {
  const className =
    "group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] flex-col rounded-[1.15rem] border border-brand-blue/8 bg-white p-5 text-left shadow-[0_8px_24px_rgba(25,27,48,0.025)] transition hover:-translate-y-0.5 hover:border-brand-coral/25 hover:shadow-[0_16px_42px_rgba(25,27,48,0.06)] md:flex-[0_0_calc(25%-0.75rem)]";

  const content = (
    <>
      <div className="flex h-full flex-col">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-coral">
          {tool.category}
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-brand-blue">
          {tool.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-gray-600">
          {tool.description}
        </p>
      </div>
    </>
  );

  if (externalLinks) {
    return (
      <a href={tool.url} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={tool.url} className={className}>
      {content}
    </Link>
  );
}

function ToolCard({
  externalLinks,
  href,
  children,
}: {
  externalLinks: boolean;
  href: string;
  children: ReactNode;
}) {
  const className =
    "group flex h-full flex-col rounded-[1.25rem] border border-brand-blue/8 bg-white p-4 shadow-[0_8px_24px_rgba(25,27,48,0.025)] transition hover:-translate-y-0.5 hover:border-brand-coral/25 hover:shadow-[0_16px_42px_rgba(25,27,48,0.06)]";

  if (externalLinks) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${
        isActive
          ? "bg-brand-blue text-white shadow-sm"
          : "bg-[#FFF3EF] text-brand-blue/65 hover:bg-brand-coral/15"
      }`}
    >
      {label}
    </button>
  );
}
