import { Fragment } from "react";
import Image from "next/image";
import PublicationFrameworkMap from "./PublicationFrameworkMap";
const headings = new Set(["Audience", "Positioning", "Offer", "Promotion", "What we want to test", "Attract", "Convert", "Retain", "Nurturing", "Referrals", "Metrics to track", "1. Strategy: APOP", "2. The action plan", "Two layers run throughout", "What’s next?"]);
function Text({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part.split("\n").map((line, j) => <Fragment key={j}>{j > 0 && <br />}{line}</Fragment>)}</Fragment>);
}
const visuals: Record<string, readonly { after: string; src: string; alt: string; caption: string; width: number; height: number }[]> = {
  jago: [{ after: "That’s where Jago began.", src: "/images/studio/jago-approvisionnement.webp", alt: "African products in a professional stockroom", caption: "Jago: making it easier for shops to source African products in bulk. Concept image.", width: 1536, height: 1024 }],
  dumaan: [{ after: "Ready-to-cook pastels, chopped vegetables and pre-prepared dish bases", src: "/images/studio/dumaan-familles.webp", alt: "Preparing Dumaan pastels in a family kitchen", caption: "Dumaan: food preparations that make meals at home easier. Concept image.", width: 1536, height: 1024 }],
  tiimora: [
    { after: "A firm can have excellent accounting software", src: "/images/studio/tiimora-admin-dispersee.webp", alt: "Requests scattered across email, WhatsApp, Excel files and sticky notes", caption: "Requests, documents and reminders scattered across tools: the daily follow-up that inspired Tiimora. Illustration.", width: 1672, height: 941 },
  ],
};
export default function EnglishArticleContent({ paragraphs, project, number }: { paragraphs: readonly string[]; project: string; number: number }) {
  const strategy = (project !== "demaa" && number === 1) || (project === "demaa" && number === 1);
  const plan = project !== "demaa" && number === 2;
  return <>{paragraphs.map((p, i) => <Fragment key={i}>
    {strategy && p === "Audience" && <PublicationFrameworkMap kind="strategy" project={project} localeCode="en" />}
    {(plan || (project === "demaa" && number === 1)) && p === "Attract" && <PublicationFrameworkMap kind="plan" project={project} localeCode="en" />}
    {headings.has(p) ? <h2 className="pt-5 text-2xl font-medium leading-tight text-brand-blue sm:text-3xl">{p}</h2> : <p><Text text={p} /></p>}
    {number === 0 && visuals[project]?.filter(v => p.startsWith(v.after)).map(v => <figure key={v.src} className="py-3"><Image src={v.src} alt={v.alt} width={v.width} height={v.height} sizes="(min-width: 720px) 680px, calc(100vw - 40px)" className="h-auto w-full rounded-2xl" /><figcaption className="mt-3 text-sm leading-6 text-dema-muted">{v.caption}</figcaption></figure>)}
  </Fragment>)}</>;
}
