import { Fragment } from "react";
import Image from "next/image";
import { articleParagraphs, articleHeading } from "@/lib/publication-contract";
import PublicationFrameworkMap from "@/components/PublicationFrameworkMap";
function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part.split("\n").map((line, j) => <Fragment key={j}>{j > 0 && <br />}{line}</Fragment>)}</Fragment>);
}
type ArticleVisual = { after: string; src: string; alt: string; caption: string; width: number; height: number };
const genesisVisuals: Record<string, ArticleVisual[]> = {
  jago: [{ after: "Jago est parti de là.", src: "/images/studio/jago-approvisionnement.webp", alt: "Produits africains dans une réserve professionnelle", caption: "Jago : faciliter l’approvisionnement des commerces en produits africains en gros. Visuel de concept.", width: 1536, height: 1024 }],
  dumaan: [{ after: "Des pastels prêts à cuire, des légumes découpés ou certaines bases déjà préparées sont des pistes.", src: "/images/studio/dumaan-familles.webp", alt: "Préparation de pastels Dumaan dans une cuisine familiale", caption: "Dumaan : des préparations pour simplifier le repas à la maison. Visuel de concept.", width: 1536, height: 1024 }],
  tiimora: [
    { after: "Un cabinet peut avoir un très bon outil comptable", src: "/images/studio/tiimora-admin-dispersee.webp", alt: "Demandes dispersées entre e-mails, WhatsApp, fichiers Excel et post-it", caption: "Demandes, pièces et relances dispersées : le suivi quotidien qui a fait émerger Tiimora. Illustration.", width: 1672, height: 941 },
  ],
};
export default function PublicationArticleContent({ text, framework, genesisProject }: { text: string; framework?: { kind: "strategy" | "plan"; project: string }; genesisProject?: string }) {
  const paragraphs = articleParagraphs(text);
  const insertion = framework ? paragraphs.findIndex(p => p === (framework.kind === "strategy" ? "Audience" : "Attirer")) : -1;
  return <>{paragraphs.map((paragraph, i) => <Fragment key={i}>
    {framework && i === (insertion < 0 ? 1 : insertion) && <PublicationFrameworkMap {...framework} />}
    {framework?.project === "demaa" && paragraph === "Attirer" && <PublicationFrameworkMap kind="plan" project="demaa" />}
    {articleHeading(paragraph) ? <h2 className="pt-5 text-2xl font-medium leading-tight text-brand-blue sm:text-3xl">{paragraph}</h2> : <p><InlineText text={paragraph} /></p>}
    {genesisProject && genesisVisuals[genesisProject]?.filter(visual => paragraph.startsWith(visual.after)).map(visual => <figure key={visual.src} className="py-3">
      <Image src={visual.src} alt={visual.alt} width={visual.width} height={visual.height} sizes="(min-width: 720px) 680px, calc(100vw - 40px)" className="h-auto w-full rounded-2xl" />
      <figcaption className="mt-3 text-sm leading-6 text-dema-muted">{visual.caption}</figcaption>
    </figure>)}
  </Fragment>)}</>;
}
