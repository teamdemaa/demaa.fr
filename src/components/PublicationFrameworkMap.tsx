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
  { title: "Audience", items: ["Qui rencontre cette difficulté ?", "Préciser les segments à tester", "Décrire le contexte et le problème", "Identifier les signes de demande"] },
  { title: "Positionnement", items: ["Quelle promesse veut-on porter ?", "Formuler le résultat attendu", "Décrire les alternatives actuelles", "Préciser la valeur et la différence"] },
  { title: "Offre", items: ["Qu’est-ce qu’on vend ? À quel prix ?", "Définir le produit et l’accompagnement", "Préciser le prix et les conditions", "Identifier les preuves à apporter"] },
  { title: "Promotion", items: ["Comment trouve-t-on nos clients ?", "Choisir les canaux adaptés à l’audience", "Préciser le rôle du contenu, du réseau et des partenaires", "Définir les premiers tests de diffusion"] },
];

const projectApop: Record<string, readonly Stage[]> = {
  jago: [
    { title: "Audience", items: ["Qui rencontre cette difficulté ?", "Boutiques, épiceries, revendeurs et e-commerçants", "Produits africains en gros, besoins récurrents", "Volumes et fréquence à comparer entre commerces"] },
    { title: "Positionnement", items: ["Quelle promesse veut-on porter ?", "Faciliter l’approvisionnement en produits africains", "Fournisseurs adaptés à la demande", "Relation commerciale et commande accompagnées"] },
    { title: "Offre", items: ["Qu’est-ce qu’on vend ? À quel prix ?", "Demande produit, quantité, fréquence et destination", "Tarifs et conditions clairs, suivi de commande", "Abonnement fournisseurs et modalités à tester"] },
    { title: "Promotion", items: ["Comment trouve-t-on nos clients ?", "Réseau de boutiques et d’épiceries", "Introductions entre commerçants", "Partenariats avec réseaux de commerces"] },
  ],
  dumaan: [
    { title: "Audience", items: ["Qui rencontre cette difficulté ?", "Familles et personnes actives en priorité", "Repas ouest-africains à la maison", "Tests de certaines préparations auprès de restaurants et traiteurs"] },
    { title: "Positionnement", items: ["Quelle promesse veut-on porter ?", "Faciliter la préparation des repas du quotidien", "Prendre en charge les étapes les plus longues", "Garder les saveurs et le plaisir de cuisiner"] },
    { title: "Offre", items: ["Qu’est-ce qu’on vend ? À quel prix ?", "Pastels prêts à cuire, légumes et bases de plats", "Préparations surgelées pour les familles", "Gamme, portions et prix à tester"] },
    { title: "Promotion", items: ["Comment trouve-t-on nos clients ?", "Vidéo signature « On mange quoi ce soir ? »", "Publicité dès le démarrage", "Dégustations et relais locaux"] },
  ],
  tiimora: [
    { title: "Audience", items: ["Qui rencontre cette difficulté ?", "Cabinets comptables de 3 à 20 salariés", "Demandes, documents, relances et échéances", "Deux cabinets pilotes pour observer les usages"] },
    { title: "Positionnement", items: ["Quelle promesse veut-on porter ?", "Centraliser le suivi opérationnel du cabinet", "Autour des outils de production existants", "Moins de relances, plus de visibilité"] },
    { title: "Offre", items: ["Qu’est-ce qu’on vend ? À quel prix ?", "Demandes clients et échéances", "Prix de test : 199 € par mois", "Installation accompagnée, frais à valider"] },
    { title: "Promotion", items: ["Comment trouve-t-on nos clients ?", "Contenus et ressources pratiques sur LinkedIn", "Publicité LinkedIn dès le démarrage", "Consultants, formateurs et réseaux de cabinets"] },
  ],
};
const genericPlan: readonly Stage[] = [
  { title: "Attirer", items: ["Comment toucher les bonnes personnes ?", "Préciser le contenu, les canaux et les partenaires", "Choisir les premières actions et leur rythme"] },
  { title: "Convertir", items: ["Quelle prochaine étape proposer ?", "Définir une offre claire et les preuves utiles", "Préciser le parcours : demande, démo ou commande"] },
  { title: "Fidéliser", items: ["Comment donner envie de revenir ?", "Prévoir la prise en main et les réponses aux questions", "Définir le suivi de l’usage, de la satisfaction et du réachat"] },
];

export default function PublicationFrameworkMap({ kind, project }: { kind: "strategy" | "plan"; project: string }) {
  const stages = kind === "strategy" ? (project === "demaa" ? apop : projectApop[project]) : (project === "demaa" ? genericPlan : plans[project]);
  if (!stages) return null;
  const layers = project === "demaa" ? ["Comment rester utile avant, pendant et après l’achat ? Préciser les contenus et les moments de contact.", "Comment faciliter les recommandations ? Préciser les occasions de recueillir des avis et des introductions."] : transverse[project];
  return <section aria-label={kind === "strategy" ? "Le cadre APOP" : "Les actions à tester"} className="my-8 rounded-2xl border border-[#d8c9ba] bg-[#f0e9df] p-4 text-brand-blue sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-medium">{kind === "strategy" ? "APOP | Cadre go-to-market" : "Le plan d’action"}</h2>
      {kind === "strategy" && <span className="text-[10px] uppercase tracking-[0.15em] text-[#795642]">Audience first</span>}
    </div>
    <ol className={`grid gap-3 ${kind === "strategy" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {stages.map((stage, index) => <li key={stage.title} className="rounded-xl border border-[#d8c9ba] bg-[#faf7f2] p-4">
        <span aria-hidden="true" className="text-xs text-[#795642]">{kind === "strategy" ? ["A", "P", "O", "P"][index] : `0${index + 1}`}</span>
        <h3 className="mt-1 text-base font-medium">{stage.title}</h3>
        {kind === "plan" && project !== "demaa" && <p className="mt-3 border-b border-[#d8c9ba] pb-3 text-base font-medium leading-6">{["Créer l’attention et la confiance", "Faciliter la décision", "Délivrer la promesse et donner envie de rester"][index]}</p>}
        {(kind === "strategy" || project === "demaa") && <p className="mt-3 border-b border-[#d8c9ba] pb-3 text-base font-normal leading-6 text-brand-blue/65">{stage.items[0]}</p>}
        <ul className="mt-3 list-disc space-y-2 pl-4 text-base leading-6 text-brand-blue/80">{(kind === "strategy" || project === "demaa" ? stage.items.slice(1) : stage.items).map(item => <li key={item}>{item}</li>)}</ul>
      </li>)}
    </ol>
    {kind === "plan" && layers && <div className="mt-4 space-y-2 text-sm leading-6">
      <p className="text-xs text-[#795642]">En transverse</p>
      <div className="grid items-center gap-1 rounded-lg bg-[#e5d8ca] px-4 py-4 sm:grid-cols-[140px_1fr]"><strong className="font-medium">Relation</strong><span>{layers[0]}</span></div>
      <div className="grid items-center gap-1 rounded-lg bg-[#604234] px-4 py-4 text-[#faf7f2] sm:grid-cols-[140px_1fr]"><strong className="font-medium">Recommandation</strong><span>{layers[1]}</span></div>
    </div>}
  </section>;
}
