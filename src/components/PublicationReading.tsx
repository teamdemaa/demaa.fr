type Reading = { author: string; title: string; href: string; context: string };
const readings: Record<string, Reading[]> = {
  "jago-0": [{ author: "Ndidi Okonkwo Nwuneli", title: "Food Entrepreneurs in Africa", href: "https://www.routledge.com/Food-Entrepreneurs-in-Africa-Scaling-Resilient-Agriculture-Businesses/Nwuneli/p/book/9780367631123", context: "Pour approfondir les enjeux de commercialisation et de développement des entreprises alimentaires africaines." }],
  "jago-1": [{ author: "Paul Graham", title: "Do Things that Don’t Scale", href: "https://paulgraham.com/ds.html", context: "Sur le travail manuel et l’attention aux premiers clients au démarrage." }],
  "dumaan-1": [{ author: "Seth Godin", title: "The smallest viable audience", href: "https://seths.blog/2022/05/the-smallest-viable-audience/", context: "Sur le choix d’une audience précise que l’on peut réellement servir." }],
  "tiimora-1": [{ author: "April Dunford", title: "A Quickstart Guide to Positioning", href: "https://www.aprildunford.com/post/a-quickstart-guide-to-positioning", context: "Sur les alternatives, la valeur différenciante et les clients pour lesquels elle compte." }],
  "demaa-2": [{ author: "Strategyzer", title: "Validate Your Ideas with the Test Card", href: "https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card", context: "Pour relier une hypothèse, un test, une mesure et un critère de décision." }],
};

export default function PublicationReading({ project, number }: { project: string; number: number }) {
  const items = readings[`${project}-${number}`];
  if (!items) return null;
  return <aside aria-label="Pour approfondir" className="mt-12 border-t border-[#d8c9ba] pt-6">
    <h2 className="text-lg font-medium">Pour approfondir</h2>
    <ul className="mt-4 space-y-4 text-base leading-7 text-dema-muted">
      {items.map(item => <li key={item.href}>
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline underline-offset-4">{item.author} · {item.title}</a>
        <p className="mt-1">{item.context}</p>
      </li>)}
    </ul>
  </aside>;
}
