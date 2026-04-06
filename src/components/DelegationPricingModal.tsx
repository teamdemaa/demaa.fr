"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText, MessageCircle, Mic, Sparkles, Wrench, X } from "lucide-react";

const STRIPE_URL_10_CREDITS =
  process.env.NEXT_PUBLIC_STRIPE_URL_10_CREDITS?.trim() ||
  "https://buy.stripe.com/14A8wIdb49lBa4Sev36Na03";
const STRIPE_URL_20_CREDITS =
  process.env.NEXT_PUBLIC_STRIPE_URL_20_CREDITS?.trim() ||
  "https://buy.stripe.com/6oU14gc7041ha4S2Ml6Na04";

type OfferKey = "free" | "pack10" | "pack20" | null;

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export default function DelegationPricingModal({
  isOpen = false,
  onClose = () => {},
  embedded = false,
  initialOffer = null,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  initialOffer?: OfferKey;
}) {
  const router = useRouter();
  const [selectedOffer, setSelectedOffer] = useState<OfferKey>(initialOffer);
  const [openCreditExample, setOpenCreditExample] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    sector: "",
    toolPreferences: "",
    automationNeed: "",
  });

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.stop();
    };
  }, []);

  const resetAndClose = () => {
    speechRecognitionRef.current?.stop();
    setIsRecording(false);
    setSelectedOffer(null);
    setIsSubmitted(false);
    setSubmitError(null);
    onClose();
  };

  const goBackToOffers = () => {
    speechRecognitionRef.current?.stop();
    setIsRecording(false);
    setSelectedOffer(null);
    setIsSubmitted(false);
    setSubmitError(null);
  };

  const validateFreeCreditForm = () => {
    if (!formData.name.trim()) return "Merci d'indiquer votre nom.";
    if (!formData.company.trim()) return "Merci d'indiquer votre entreprise.";
    if (!formData.email.trim()) return "Merci d'indiquer votre email pro.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Merci d'indiquer un email valide.";
    }
    if (!formData.phone.trim()) return "Merci d'indiquer votre téléphone ou WhatsApp.";
    if (!formData.automationNeed.trim()) {
      return "Merci de décrire l'automatisation que vous souhaitez tester.";
    }

    return null;
  };

  const handleFreeCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validateFreeCreditForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          offer: "2 crédits offerts",
          details: formData.automationNeed,
          toolPreferences: formData.toolPreferences,
          source: embedded ? "Delegation page free credit" : "Delegation modal free credit",
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d'envoyer votre demande pour le moment. Merci de réessayer."
        );
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Delegation lead submission failed", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer votre demande pour le moment. Merci de réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaidOffer = (url: string) => {
    if (!url) return;
    window.location.assign(url);
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    if (isRecording) {
      speechRecognitionRef.current?.stop();
      return;
    }

    const browserWindow = window as SpeechRecognitionWindow;
    const SpeechRecognitionConstructor =
      browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      window.alert("La dictée vocale n'est pas prise en charge sur ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      setFormData((current) => ({
        ...current,
        automationNeed: transcript.trim(),
      }));
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      speechRecognitionRef.current = null;
    };

    speechRecognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const offers = [
    {
      key: "free" as const,
      badge: "2 crédits offerts",
      title: "Pour tester",
      subtitle: "Première automatisation",
      bullets: [
        "2 crédits offerts, sans engagement",
        "On cadre votre besoin ensemble",
        "On livre une première automatisation",
        "Pour valider avant d'aller plus loin",
      ],
      price: "Gratuit",
      unit: "",
      cta: "Tester gratuitement",
      featured: true,
    },
    {
      key: "pack10" as const,
      badge: "10 crédits",
      title: "Pack de départ",
      subtitle: "10 crédits à utiliser comme vous voulez",
      bullets: [
        "Simple ou complexe, vous choisissez",
        "2 crédits = une automatisation simple",
        "Une automatisation complexe en consomme plus",
      ],
      price: "650€",
      unit: "65€ / crédit",
      cta: STRIPE_URL_10_CREDITS ? "Choisir 10 crédits" : "Bientôt dispo",
      stripeUrl: STRIPE_URL_10_CREDITS,
    },
    {
      key: "pack20" as const,
      badge: "20 crédits",
      title: "Pack intensif",
      subtitle: "20 crédits à utiliser comme vous voulez",
      bullets: [
        "Simple ou complexe, vous choisissez",
        "Le prix par crédit le plus bas",
        "Idéal si vous avez beaucoup à automatiser",
      ],
      price: "980€",
      unit: "49€ / crédit",
      cta: STRIPE_URL_20_CREDITS ? "Choisir 20 crédits" : "Bientôt dispo",
      stripeUrl: STRIPE_URL_20_CREDITS,
    },
  ];

  const includedItems = [
    {
      icon: Sparkles,
      title: "Sans abonnement",
      description:
        "Vous avancez à votre rythme. Vous achetez seulement ce dont vous avez besoin.",
    },
    {
      icon: FileText,
      title: "Documentation claire",
      description:
        "Chaque automatisation livrée est expliquée pour que vous gardiez la main et puissiez la faire évoluer plus tard.",
    },
    {
      icon: Wrench,
      title: "Support si ça casse",
      description:
        "Si une automatisation tombe en panne après livraison, on corrige sans vous redébiter.",
    },
    {
      icon: MessageCircle,
      title: "Un seul interlocuteur",
      description:
        "Vous échangez directement avec quelqu'un qui suit votre sujet du début à la fin, notamment sur WhatsApp.",
    },
  ];

  const creditExamples = [
    {
      title: "Process simple",
      credits: "2 crédits",
      subtitle: "Des étapes basiques, un seul outil ou deux outils qui se parlent.",
      items: [
        "Un prospect remplit votre formulaire de contact -> vous recevez une alerte sur WhatsApp",
        "Un rendez-vous est pris en ligne -> un rappel est envoyé automatiquement au client la veille",
        "Un client répond à un questionnaire -> ses réponses sont ajoutées à votre tableau de suivi",
        "Une mission est terminée -> le client reçoit automatiquement un email de demande d'avis",
      ],
    },
    {
      title: "Process intermédiaire",
      credits: "3 - 4 crédits",
      subtitle: "Plusieurs outils connectés, des conditions ou des données à transformer.",
      items: [
        "Un prospect remplit un formulaire -> qualifié selon ses réponses -> ajouté au CRM -> email de prise de contact envoyé",
        "Un brief client rempli -> devis généré automatiquement -> envoyé pour validation -> archivé",
        "Une intervention terminée -> rapport d'intervention généré -> envoyé au client -> copie stockée dans le Drive",
        "Un nouveau collaborateur rejoint -> accès créés -> email de bienvenue -> tâches d'onboarding assignées",
      ],
    },
    {
      title: "Process complet",
      credits: "5 crédits et plus",
      subtitle:
        "Un flux de bout en bout, plusieurs outils, des données volumineuses ou de la logique conditionnelle.",
      items: [
        "Un prospect arrive -> qualifié -> ajouté au CRM -> séquence de nurturing -> relance automatique -> alerte si pas de réponse",
        "Un formulaire métier rempli -> document généré automatiquement -> envoyé pour signature électronique -> stocké dans le Drive",
        "Un nouveau client signé -> contrat généré -> accès créés -> onboarding déclenché -> suivi automatique sur 30 jours",
        "Les données de suivi de plusieurs missions centralisées -> tableau de bord mis à jour -> rapport mensuel envoyé automatiquement",
      ],
    },
  ] as const;

  const processSteps = [
    {
      step: "01",
      title: "On liste ce qui vous fait perdre du temps",
      description:
        "On repère les tâches répétitives, les relances, les copier-coller, les oublis et les allers-retours qui reviennent chaque semaine.",
    },
    {
      step: "02",
      title: "On dessine la bonne solution",
      description:
        "On structure les étapes, on choisit les bons outils et on garde seulement ce qui est vraiment utile pour votre façon de travailler.",
    },
    {
      step: "03",
      title: "On met en place, on teste, puis on ajuste",
      description:
        "On implémente le système, on le teste dans des conditions réelles et on prévoit 2 ajustements pour l'affiner si besoin.",
    },
  ] as const;

  const content = (
    <>
      {!embedded && (
        <button
          onClick={selectedOffer === "free" ? goBackToOffers : resetAndClose}
          className="absolute right-5 top-5 z-10 text-gray-300 transition-colors hover:text-brand-blue"
          aria-label={selectedOffer === "free" ? "Retour aux offres" : "Fermer"}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {!selectedOffer && (
        <div className={embedded ? "space-y-24 md:space-y-28" : "space-y-8"}>
          <section className="space-y-8 md:space-y-10">
            <div className="space-y-3 text-center">
              <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                Choisissez votre formule
              </h2>
              <p className="mx-auto max-w-4xl text-sm leading-relaxed text-gray-500 md:text-base">
                Les crédits sont votre monnaie. Choisissez selon combien d&apos;automatisations vous voulez, plus vous prenez de crédits, moins chaque crédit coûte.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.key}
                  className={`grid h-full grid-rows-[auto_auto_1fr_auto_auto] rounded-[1.75rem] border ${
                    embedded ? "p-6 md:p-7" : "p-5"
                  } ${
                    offer.featured
                      ? "border-brand-coral/15 bg-brand-coral/5"
                      : "border-black/5 bg-white"
                  }`}
                >
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                    {offer.badge}
                  </div>
                  <div className="mt-4 min-h-[4.9rem] space-y-1.5">
                    <div className="text-[1.2rem] leading-[1.08] font-semibold tracking-tight text-brand-blue">
                      {offer.title}
                    </div>
                    <div className="text-[0.92rem] font-light text-gray-400">
                      {offer.subtitle}
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {offer.bullets.map((bullet) => (
                      <div key={bullet} className="grid grid-cols-[0.75rem_1fr] items-start gap-x-3">
                        <span className="mt-[0.42rem] h-2.5 w-2.5 rounded-full bg-brand-coral/65" />
                        <p className="m-0 text-[0.82rem] font-light leading-relaxed text-gray-500">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-black/5 pt-4">
                    <div className="grid min-h-[3rem] items-center gap-2 sm:grid-cols-[auto_1fr]">
                      <div className="text-[1.85rem] leading-none font-black tracking-tight text-brand-blue">
                        {offer.price}
                      </div>
                      <div className="text-[0.9rem] font-medium text-gray-400 sm:text-left">
                        {offer.unit}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                  onClick={() =>
                    offer.key === "free"
                      ? embedded
                        ? router.push("/deleguer-mes-automatisations/test-gratuit")
                        : setSelectedOffer("free")
                      : handlePaidOffer(offer.stripeUrl || "")
                  }
                    disabled={offer.key !== "free" && !offer.stripeUrl}
                    className={`mt-4 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition-colors ${
                      offer.featured
                        ? "bg-brand-blue text-white hover:bg-brand-coral"
                        : offer.stripeUrl
                          ? "bg-brand-blue text-white hover:bg-brand-coral"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {offer.cta}
                  </button>
                  <div className="pt-4" />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8 md:space-y-10">
            <div className="space-y-2">
              <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                Comment ça marche ?
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                On avance simplement, avec vous, pour construire quelque chose d&apos;utile dès le départ. Pas une usine à gaz. Pas un système impossible à reprendre.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {processSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.75rem] border border-black/5 bg-white px-5 py-6 md:px-6"
                >
                  <div className="text-[0.78rem] font-black tracking-[0.22em] text-brand-coral">
                    {item.step}
                  </div>
                  <div className="mt-3 text-[1.1rem] font-semibold tracking-tight text-brand-blue">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

          </section>

          <section className="space-y-8 rounded-[2rem] bg-brand-coral/6 px-5 py-6 md:space-y-10 md:px-7 md:py-8">
            <div className="space-y-2">
              <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
              De quoi dépend le niveau d&apos;accompagnement ?
              </h2>
              <p className="max-w-4xl text-sm leading-relaxed text-gray-500 md:text-base">
                Toutes les automatisations ne demandent pas le même travail. Certaines sont très simples à mettre en place. D&apos;autres demandent plus d&apos;outils, plus de logique ou plus de vérifications.
              </p>
            </div>
            <div className="space-y-3">
              {creditExamples.map((example, index) => {
                const isOpen = openCreditExample === index;

                return (
                  <div
                    key={example.title}
                    className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenCreditExample(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-base font-semibold tracking-tight text-brand-blue">
                          {example.title}
                        </div>
                        <div className="inline-flex items-center rounded-full bg-brand-coral/10 px-3 py-1 text-sm font-semibold text-brand-coral">
                          {example.credits}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-brand-blue/45 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-black/5 px-5 py-4">
                        <p className="mb-4 text-sm font-light leading-relaxed text-gray-500">
                          {example.subtitle}
                        </p>
                        <div className="space-y-3">
                          {example.items.map((item) => (
                            <div key={item} className="grid grid-cols-[0.75rem_1fr] items-start gap-x-3">
                              <span className="mt-[0.42rem] h-2.5 w-2.5 rounded-full bg-brand-coral/75" />
                              <p className="m-0 text-[0.92rem] font-light leading-relaxed text-gray-500">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm leading-relaxed text-gray-600">
              Le plus simple reste de nous décrire ce que vous faites aujourd&apos;hui. On vous aide ensuite à estimer ce qu&apos;il faut vraiment.
            </p>
          </section>

          <section className="space-y-8 md:space-y-10">
            <div className="space-y-2">
              <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
              Ce qu&apos;on prend en charge avec vous
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                L&apos;idée n&apos;est pas juste d&apos;automatiser une tâche. L&apos;idée, c&apos;est que ça tourne bien, que ce soit clair, et que vous sachiez où vous mettez les pieds.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {includedItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-black/5 bg-brand-blue/5 px-5 py-5"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-coral shadow-[0_4px_10px_rgba(16,24,40,0.04)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-base font-semibold text-brand-blue">
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {selectedOffer === "free" && (
        <div className={`space-y-6 ${embedded ? "max-w-3xl" : ""}`}>
          <div className={`space-y-2 ${embedded ? "max-w-2xl" : "max-w-xl pr-10"}`}>
            {!embedded && (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-coral/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-coral">
                <Sparkles className="h-3.5 w-3.5" />
                2 crédits offerts
              </div>
            )}
            <h3 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.4rem]">
              Tester une automatisation simple
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 md:text-base">
              Décrivez votre besoin. Vous recevrez ensuite un message sur WhatsApp pour cadrer le process à automatiser.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleFreeCreditSubmit} className="max-w-3xl space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
                <input
                  required
                  type="text"
                  placeholder="Entreprise"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  type="email"
                  placeholder="Email pro"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
                <input
                  required
                  type="tel"
                  placeholder="Téléphone / WhatsApp"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Secteur d'activité"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
                <input
                  type="text"
                  placeholder="Préférences outils (facultatif)"
                  value={formData.toolPreferences}
                  onChange={(e) =>
                    setFormData({ ...formData, toolPreferences: e.target.value })
                  }
                  className="demaa-input h-12 rounded-2xl border border-brand-blue/10 px-4 text-sm font-medium shadow-none"
                />
              </div>

              <div className="relative">
                <textarea
                  required
                  placeholder="Décrivez l'automatisation simple que vous voulez tester"
                  value={formData.automationNeed}
                  onChange={(e) =>
                    setFormData({ ...formData, automationNeed: e.target.value })
                  }
                  className="demaa-textarea min-h-[120px] w-full rounded-[1.5rem] border border-brand-blue/10 px-4 py-3.5 pr-14 text-sm font-medium shadow-none"
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  aria-label={isRecording ? "Arrêter la note vocale" : "Ajouter un vocal"}
                  className={`absolute bottom-3.5 right-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isRecording
                      ? "bg-brand-coral text-white"
                      : "bg-gray-100 text-brand-blue hover:bg-gray-200"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              {submitError && (
                <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-600">
                  {submitError}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-3.5 text-sm font-black text-white transition-colors hover:bg-brand-coral"
                >
                  {isSubmitting
                    ? "Envoi en cours..."
                    : "Déléguer ma première automatisation"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-[1.5rem] border border-brand-coral/15 bg-[#FFF9F8] px-6 py-12 text-center">
              <div className="text-2xl font-black text-brand-blue">C&apos;est envoyé</div>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Vous allez être recontacté sur WhatsApp pour cadrer les détails de votre première automatisation.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className="px-4 pb-20 pt-12 md:px-6 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {content}
        </div>
      </section>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="fixed inset-0 z-50 bg-brand-blue/50 backdrop-blur-sm px-5 py-8 md:px-8 md:py-10"
        >
          <div className="flex h-full w-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full overflow-y-auto soft-scroll rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_30px_80px_rgba(21,36,69,0.18)] md:p-6 ${
                selectedOffer === "free"
                  ? "max-h-[calc(100vh-6rem)] max-w-4xl"
                  : "max-h-[calc(100vh-6rem)] max-w-[68rem]"
              }`}
            >
              {content}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
