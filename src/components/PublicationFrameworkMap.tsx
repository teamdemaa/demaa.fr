type Stage = { title: string; items: readonly string[] };

const plans: Record<string, readonly Stage[]> = {
  tiimora: [
    { title: "Attirer", items: ["Contenu utile sur LinkedIn, publicité LinkedIn", "Partenariats avec consultants, introductions"] },
    { title: "Convertir", items: ["Ressource pratique, diagnostic de 30 minutes", "Démo adaptée, offre claire"] },
    { title: "Fidéliser", items: ["Prise en main guidée, réponses aux questions", "Suivi de l’utilisation, extension des usages"] },
  ],
  jago: [
    { title: "Attirer", items: ["Réseau de commerçants, introductions", "Partenariats avec réseaux de commerces"] },
    { title: "Convertir", items: ["Besoin produit, quantité, destination", "Offre chiffrée, commande accompagnée"] },
    { title: "Fidéliser", items: ["Suivi de commande, résolution des problèmes", "Anticipation du réapprovisionnement"] },
  ],
  dumaan: [
    { title: "Attirer", items: ["Vidéo signature « On mange quoi ce soir ? », publicité", "Dégustations, relais locaux"] },
    { title: "Convertir", items: ["Menu, portions et prix clairs", "Première commande, livraison expliquée"] },
    { title: "Fidéliser", items: ["Conseils de préparation, réponses aux questions", "Retours après les repas, nouvelle commande"] },
  ],
};
const transverse: Record<string, readonly [string, string]> = {
  tiimora: ["Exemples de processus, cas d’usage", "Introductions entre cabinets, témoignages"],
  jago: ["Disponibilités produits, conseils d’approvisionnement", "Introductions entre commerçants"],
  dumaan: ["Menus de la semaine, idées de repas", "Bouche-à-oreille, parrainage"],
};
const apop: readonly Stage[] = [
  { title: "Audience", items: ["Qui rencontre cette difficulté ?", "Segment prioritaire", "Contexte et besoins", "Difficulté et signaux de demande"] },
  { title: "Positionnement", items: ["Quelle promesse veut-on porter ?", "Problème prioritaire", "Résultat attendu et différence", "Message clé"] },
  { title: "Offre", items: ["Qu’est-ce qu’on vend ? À quel prix ?", "Produit et périmètre", "Prix et modalités", "Preuves et réassurance"] },
  { title: "Promotion", items: ["Comment trouve-t-on nos clients ?", "Contenu et ressources utiles", "Publicité et partenariats", "Réseau et recommandations"] },
];

export default function PublicationFrameworkMap({ kind, project }: { kind: "strategy" | "plan"; project: string }) {
  const stages = kind === "strategy" ? apop : plans[project];
  if (!stages) return null;
  const layers = transverse[project];
  return <section aria-label={kind === "strategy" ? "Le cadre APOP" : "Les actions à tester"} className="my-8 rounded-2xl border border-[#d8c9ba] bg-[#f0e9df] p-4 text-brand-blue sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-medium">{kind === "strategy" ? "APOP | Go-to-market framework" : "Le plan d’action"}</h2>
      {kind === "strategy" && <span className="text-[10px] uppercase tracking-[0.15em] text-[#795642]">Audience first</span>}
    </div>
    <ol className={`grid gap-3 ${kind === "strategy" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {stages.map((stage, index) => <li key={stage.title} className="rounded-xl border border-[#d8c9ba] bg-[#faf7f2] p-4">
        <span aria-hidden="true" className="text-xs text-[#795642]">{kind === "strategy" ? ["A", "P", "O", "P"][index] : `0${index + 1}`}</span>
        <h3 className="mt-1 text-base font-medium">{stage.title}</h3>
        {kind === "plan" && <p className="mt-3 border-b border-[#d8c9ba] pb-3 text-base font-medium leading-6">{["Créer l’attention et la confiance", "Faciliter la décision", "Délivrer la promesse et donner envie de rester"][index]}</p>}
        {kind === "strategy" && <p className="mt-3 border-b border-[#d8c9ba] pb-3 text-base font-medium leading-6">{stage.items[0]}</p>}
        <ul className="mt-3 list-disc space-y-2 pl-4 text-base leading-6 text-brand-blue/80">{(kind === "strategy" ? stage.items.slice(1) : stage.items).map(item => <li key={item}>{item}</li>)}</ul>
      </li>)}
    </ol>
    {kind === "plan" && layers && <div className="mt-4 space-y-2 text-sm leading-6">
      <p className="text-xs text-[#795642]">En transverse</p>
      <div className="grid items-center gap-1 rounded-lg bg-[#e5d8ca] px-4 py-4 sm:grid-cols-[140px_1fr]"><strong className="font-medium">Relation</strong><span>{layers[0]}</span></div>
      <div className="grid items-center gap-1 rounded-lg bg-[#604234] px-4 py-4 text-[#faf7f2] sm:grid-cols-[140px_1fr]"><strong className="font-medium">Recommandation</strong><span>{layers[1]}</span></div>
    </div>}
  </section>;
}
