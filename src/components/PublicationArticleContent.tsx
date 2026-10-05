import { Fragment } from "react";
import { articleParagraphs, articleHeading } from "@/lib/publication-contract";
function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part.split("\n").map((line, j) => <Fragment key={j}>{j > 0 && <br />}{line}</Fragment>)}</Fragment>);
}
export default function PublicationArticleContent({ text }: { text: string }) {
  return <>{articleParagraphs(text).map((paragraph, i) => articleHeading(paragraph) ? <h2 key={i} className="pt-5 text-2xl font-medium leading-tight text-brand-blue sm:text-3xl">{paragraph}</h2> : <p key={i}><InlineText text={paragraph} /></p>)}</>;
}
