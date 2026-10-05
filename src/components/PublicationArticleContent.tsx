import { Fragment } from "react";
import { articleParagraphs, articleHeading } from "@/lib/publication-contract";
import PublicationFrameworkMap from "@/components/PublicationFrameworkMap";
function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part.split("\n").map((line, j) => <Fragment key={j}>{j > 0 && <br />}{line}</Fragment>)}</Fragment>);
}
export default function PublicationArticleContent({ text, framework }: { text: string; framework?: { kind: "strategy" | "plan"; project: string } }) {
  const paragraphs = articleParagraphs(text);
  const insertion = framework ? paragraphs.findIndex(p => p === (framework.kind === "strategy" ? "Audience" : "Attirer")) : -1;
  return <>{paragraphs.map((paragraph, i) => <Fragment key={i}>
    {framework && i === (insertion < 0 ? 1 : insertion) && <PublicationFrameworkMap {...framework} />}
    {articleHeading(paragraph) ? <h2 className="pt-5 text-2xl font-medium leading-tight text-brand-blue sm:text-3xl">{paragraph}</h2> : <p><InlineText text={paragraph} /></p>}
  </Fragment>)}</>;
}
