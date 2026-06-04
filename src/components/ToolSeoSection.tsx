import Link from "next/link";
import type { FreeToolSeo } from "@/lib/free-tool-seo";

type ToolSeoSectionProps = {
  tool: FreeToolSeo;
};

export default function ToolSeoSection({ tool }: ToolSeoSectionProps) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `https://demaa.fr${tool.path}`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      description: tool.metaDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://demaa.fr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Kit du dirigeant",
          item: "https://demaa.fr/outils",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.title,
          item: `https://demaa.fr${tool.path}`,
        },
      ],
    },
  ];

  return (
    <section className="border-t border-brand-blue/8 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
            Outil gratuit Demaa
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-blue">
            {tool.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            {tool.intro}
          </p>

          <div className="mt-7">
            <h3 className="text-sm font-semibold text-brand-blue">
              Cas d&apos;usage courants
            </h3>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-gray-600 sm:grid-cols-3">
              {tool.useCases.map((useCase) => (
                <li key={useCase} className="rounded-lg border border-brand-blue/8 p-4">
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-7">
          <div>
            <h3 className="text-sm font-semibold text-brand-blue">
              Questions fréquentes
            </h3>
            <div className="mt-3 divide-y divide-brand-blue/8 rounded-lg border border-brand-blue/8">
              {tool.faqs.map((faq) => (
                <details key={faq.question} className="group p-4">
                  <summary className="cursor-pointer list-none text-sm font-medium text-brand-blue">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-blue">
              Outils liés
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {tool.related.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-brand-blue/10 px-4 py-2 text-xs font-medium text-brand-blue transition-colors hover:border-brand-coral/40 hover:text-brand-coral"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
