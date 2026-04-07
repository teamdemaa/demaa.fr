"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Mail,
  Mic,
  MessageCircle,
  Send,
  Sparkles,
  FileText,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import DelegationPricingModal from "./DelegationPricingModal";

const STRIPE_URL_10_CREDITS =
  process.env.NEXT_PUBLIC_STRIPE_URL_10_CREDITS?.trim() ||
  "https://buy.stripe.com/14A8wIdb49lBa4Sev36Na03";
const STRIPE_URL_20_CREDITS =
  process.env.NEXT_PUBLIC_STRIPE_URL_20_CREDITS?.trim() ||
  "https://buy.stripe.com/6oU14gc7041ha4S2Ml6Na04";

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.72, ease: "easeOut" },
} as const;

interface ActionPlanItem {
  title: string;
  why: string;
  how: string;
  tool: string;
  effort: string;
  time_gain: string;
}

interface AIResponse {
  summary: string;
  goal: string;
  actions: ActionPlanItem[];
}

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
  continuous: boolean;
  interimResults: boolean;
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

interface GenerationLimitState {
  count: number;
  remaining: number;
  limitReached: boolean;
}

const LOADING_QUOTES = [
  {
    text: "Ce qui se mesure s'améliore.",
    author: "Peter Drucker",
  },
  {
    text: "Si vous ne pouvez pas decrire ce que vous faites comme un processus, c'est que vous ne le maitrisez pas.",
    author: "W. Edwards Deming",
  },
  {
    text: "On ne subit pas son entreprise quand on met en place les bons systemes.",
    author: "Demaa",
  },
  {
    text: "La simplicite consiste a faire en sorte que l'essentiel soit evident.",
    author: "Olivier Rebiere",
  },
];

const MAX_GENERATIONS_PER_USER = 3;

const HOME_STEPS = [
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

const HOME_INCLUDED_ITEMS = [
  {
    icon: Sparkles,
    title: "Sans abonnement",
    description: "Vous avancez à votre rythme. Vous achetez seulement ce dont vous avez besoin.",
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
] as const;

const HOME_CREDIT_EXAMPLES = [
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

const HOME_TRANSFORMATION_EXAMPLES = [
  {
    process: "Suivi des leads entrants",
    context:
      "Les prospects arrivent de partout - formulaire, Instagram, email - et tombent dans le vide.",
    before:
      "Aucune centralisation, pas de suivi, relances oubliées, clients perdus sans s'en rendre compte",
    after:
      "Toutes les sources centralisées, réponse automatique immédiate, relance déclenchée si pas de retour sous 48h",
  },
  {
    process: "Onboarding client",
    context:
      "La première impression après la signature est souvent chaotique - des emails dans le désordre, des docs oubliés.",
    before:
      "Infos envoyées en plusieurs fois, contrat par email, accès donnés à la main, premier contact raté",
    after:
      "Dès la signature : email de bienvenue, documents, accès et premier RDV envoyés automatiquement en une séquence",
  },
  {
    process: "Rapports clients",
    context:
      "La valeur du travail reste invisible si on ne la montre pas. Les clients qui partent, c'est souvent pour ça.",
    before:
      "Le client ne sait pas ce qu'on a fait, tout doit être réexpliqué à chaque appel, la relation s'érode",
    after:
      "Rapport mensuel généré et envoyé automatiquement : heures, livrables, résultats - sans y penser",
  },
  {
    process: "Relances impayés",
    context:
      "On évite de relancer par gêne, on oublie, et la trésorerie en souffre en silence.",
    before:
      "Factures en retard détectées trop tard, relances écrites à la main, argent perdu par inaction",
    after:
      "Relance automatique à J+5, J+15, J+30 avec le bon ton - sans jamais avoir à y penser",
  },
] as const;

type HomeOffer = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  price: string;
  unit: string;
  cta: string;
  action: "modal" | "link";
  featured?: boolean;
  href?: string;
};

const HOME_OFFERS: readonly HomeOffer[] = [
  {
    badge: "2 crédits offerts",
    title: "Tester gratuitement",
    subtitle: "Première automatisation",
    description:
      "2 crédits offerts pour cadrer votre besoin et lancer une première automatisation simple.",
    bullets: [
      "2 crédits offerts, sans engagement",
      "On cadre votre besoin ensemble",
      "On livre une première automatisation",
      "Pour valider avant d'aller plus loin",
    ],
    price: "Gratuit",
    unit: "",
    cta: "Tester gratuitement",
    action: "modal" as const,
    featured: true,
  },
  {
    badge: "10 crédits",
    title: "Automate",
    subtitle: "10 crédits à utiliser comme vous voulez",
    description:
      "Pour commencer à structurer plusieurs tâches sans vous engager dans un abonnement.",
    bullets: [
      "Simple ou complexe, vous choisissez",
      "2 crédits = une automatisation simple",
      "Une automatisation complexe en consomme plus",
    ],
    price: "650€",
    unit: "65€ / crédit",
    cta: "Choisir 10 crédits",
    action: "link" as const,
    href: STRIPE_URL_10_CREDITS,
  },
  {
    badge: "20 crédits",
    title: "Maestro",
    subtitle: "20 crédits à utiliser comme vous voulez",
    description:
      "Pour les activités qui ont déjà plusieurs sujets à automatiser et veulent avancer plus vite.",
    bullets: [
      "Simple ou complexe, vous choisissez",
      "Le prix par crédit le plus bas",
      "Idéal si vous avez beaucoup à automatiser",
    ],
    price: "980€",
    unit: "49€ / crédit",
    cta: "Choisir 20 crédits",
    action: "link" as const,
    href: STRIPE_URL_20_CREDITS,
  },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeAIResponse(payload: unknown): AIResponse {
  if (!isRecord(payload)) {
    throw new Error("Réponse invalide reçue depuis l'assistant.");
  }

  const rawActions = Array.isArray(payload.actions) ? payload.actions : [];

  return {
    summary: toText(
      payload.summary,
      "Voici un plan d'action simple pour remettre votre activité au clair et automatiser l'essentiel."
    ),
    goal: toText(
      payload.goal,
      "Mettre en place des bases simples pour gagner du temps chaque semaine."
    ),
    actions: rawActions.map((action, index) => {
      const rawAction = isRecord(action) ? action : {};

      return {
        title: toText(rawAction.title, `Action ${index + 1}`),
        why: toText(
          rawAction.why,
          "Cette action aide à rendre votre activité plus simple à piloter."
        ),
        how: toText(
          rawAction.how,
          "Mettre en place une routine simple avec un outil clair et peu de manipulations."
        ),
        tool: toText(rawAction.tool, "Google Sheets"),
        effort: toText(rawAction.effort, "moyen"),
        time_gain: toText(rawAction.time_gain, "Quelques heures gagnées par semaine"),
      };
    }),
  };
}

function escapeCSV(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mergeTranscript(baseText: string, transcript: string) {
  const trimmedBase = baseText.trim();
  const trimmedTranscript = transcript.trim();

  if (!trimmedBase) return trimmedTranscript;
  if (!trimmedTranscript) return trimmedBase;

  return `${trimmedBase} ${trimmedTranscript}`;
}

function navigateToHref(router: ReturnType<typeof useRouter>, href: string) {
  if (href.startsWith("http")) {
    window.location.href = href;
    return;
  }

  router.push(href);
}

function navigateToPricing() {
  window.dispatchEvent(new Event("demaa:open-free-trial"));
}

function buildHoursRecap(actions: ActionPlanItem[]) {
  let minMinutes = 0;
  let maxMinutes = 0;

  actions.forEach((action) => {
    const text = action.time_gain.toLowerCase().replace(/,/g, ".");
    const numbers = Array.from(text.matchAll(/\d+(?:\.\d+)?/g)).map((match) =>
      Number.parseFloat(match[0])
    );

    if (numbers.length === 0) return;

    const isMinutes = text.includes("minute");
    const factor = isMinutes ? 1 : 60;
    const low = numbers[0] * factor;
    const high = (numbers[1] ?? numbers[0]) * factor;

    minMinutes += low;
    maxMinutes += high;
  });

  if (maxMinutes === 0) {
    return "Gain estimé par semaine : plusieurs heures à récupérer (estimation)";
  }

  const formatHours = (minutes: number) => {
    const hours = minutes / 60;
    if (hours < 1) return `${Math.round(minutes)} min`;
    if (Number.isInteger(hours)) return `${hours}h`;
    return `${hours.toFixed(1).replace(".", ",")}h`;
  };

  if (Math.round(minMinutes) === Math.round(maxMinutes)) {
    return `Gain estimé par semaine : ${formatHours(maxMinutes)} (estimation)`;
  }

  return `Gain estimé par semaine : ${formatHours(minMinutes)} à ${formatHours(maxMinutes)} (estimation)`;
}

function withEstimationLabel(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return trimmedValue;
  if (trimmedValue.toLowerCase().includes("estimation")) return trimmedValue;

  const mentionsTime = /(\d|\bheures?\b|\bh\b|\bminutes?\b|\bmin\b)/i.test(trimmedValue);
  if (!mentionsTime) return trimmedValue;

  return `${trimmedValue} (estimation)`;
}

async function persistGeneration(input: {
  email: string;
  prompt: string;
  result: AIResponse;
}) {
  const response = await fetch("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Impossible d'enregistrer cette génération."
    );
  }
}

async function fetchGenerationLimit(email: string): Promise<GenerationLimitState> {
  const response = await fetch(`/api/generations?email=${encodeURIComponent(email)}`);
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Impossible de verifier la limite de generations.");
  }

  return {
    count: typeof data.count === "number" ? data.count : 0,
    remaining: typeof data.remaining === "number" ? data.remaining : MAX_GENERATIONS_PER_USER,
    limitReached: Boolean(data.limitReached),
  };
}

export default function AssistantHub() {
  const router = useRouter();
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const homeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechBaseTextRef = useRef("");
  const [inputValue, setInputValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [pendingResult, setPendingResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [hasUnlockedPlan, setHasUnlockedPlan] = useState(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [openHomeCreditExample, setOpenHomeCreditExample] = useState(1);
  const [generationCount, setGenerationCount] = useState(0);
  const [generationLimitReached, setGenerationLimitReached] = useState(false);

  useEffect(() => {
    const openFreeTrialModal = () => {
      speechRecognitionRef.current?.stop();
      setIsLoading(false);
      setIsRecording(false);
      setError(null);
      setEmailError(null);
      setShowEmailModal(false);
      setShowFreeTrialModal(true);
    };

    window.addEventListener("demaa:open-free-trial", openFreeTrialModal);

    if (new URLSearchParams(window.location.search).get("delegation") === "free") {
      window.history.replaceState(null, "", "/");
      openFreeTrialModal();
    }

    return () => {
      window.removeEventListener("demaa:open-free-trial", openFreeTrialModal);
    };
  }, []);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("demaa_assistant_email");
    const unlocked = window.localStorage.getItem("demaa_assistant_unlocked");

    if (savedEmail) {
      setEmailValue(savedEmail);
    }

    if (unlocked === "true") {
      setHasUnlockedPlan(true);
    }
  }, []);

  useEffect(() => {
    if (!emailValue.trim() || !isValidEmail(emailValue.trim())) return;

    void (async () => {
      try {
        const limitState = await fetchGenerationLimit(emailValue.trim());
        setGenerationCount(limitState.count);
        setGenerationLimitReached(limitState.limitReached);
      } catch (limitError) {
        console.error("Generation limit fetch error:", limitError);
      }
    })();
  }, [emailValue]);

  useEffect(() => {
    if (!isLoading) return;

    const interval = window.setInterval(() => {
      setActiveQuoteIndex((current) => (current + 1) % LOADING_QUOTES.length);
    }, 4800);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.stop();
    };
  }, []);

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
      setError("La dictée vocale n'est pas disponible sur ce navigateur.");
      return;
    }

    setError(null);

    const recognition = new SpeechRecognitionConstructor();
    speechRecognitionRef.current = recognition;
    speechBaseTextRef.current = inputValue;

    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0]?.transcript ?? ""} `;
      }

      setInputValue(mergeTranscript(speechBaseTextRef.current, transcript));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Le micro a été refusé. Autorisez l'accès pour utiliser la note vocale.");
      } else {
        setError("La dictée vocale a rencontré un problème. Réessayez.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      speechRecognitionRef.current = null;
    };

    recognition.start();
    setIsRecording(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (generationLimitReached) {
      navigateToPricing();
      return;
    }

    speechRecognitionRef.current?.stop();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error);
      }

      const normalizedResult = normalizeAIResponse(data);

      if (hasUnlockedPlan) {
        if (emailValue.trim() && isValidEmail(emailValue.trim())) {
          await persistGeneration({
            email: emailValue.trim(),
            prompt: inputValue,
            result: normalizedResult,
          });

          const limitState = await fetchGenerationLimit(emailValue.trim());
          setGenerationCount(limitState.count);
          setGenerationLimitReached(limitState.limitReached);
        }

        setResult(normalizedResult);
      } else {
        setPendingResult(normalizedResult);
        setShowEmailModal(true);
      }
    } catch (err: unknown) {
      console.error("Assistant Hub Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la communication avec l'assistant."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = emailValue.trim();
    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Entrez une adresse email valide.");
      return;
    }

    setEmailError(null);

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "Assistant Demaa",
          sector: inputValue.slice(0, 140),
          email: trimmedEmail,
          source: "Assistant plan modal",
        }),
      });

      if (pendingResult) {
        await persistGeneration({
          email: trimmedEmail,
          prompt: inputValue,
          result: pendingResult,
        });
      }

      const limitState = await fetchGenerationLimit(trimmedEmail);
      setGenerationCount(limitState.count);
      setGenerationLimitReached(limitState.limitReached);
    } catch (leadError) {
      console.error("Lead capture error:", leadError);
    }

    window.localStorage.setItem("demaa_assistant_email", trimmedEmail);
    window.localStorage.setItem("demaa_assistant_unlocked", "true");

    setHasUnlockedPlan(true);
    setShowEmailModal(false);

    if (pendingResult) {
      setResult(pendingResult);
      setPendingResult(null);
    }
  };

  const closeModal = () => {
    if (pendingResult) return;
    setShowEmailModal(false);
  };

  const generatePDF = () => {
    if (!result || !pdfContentRef.current) return;

    void (async () => {
      const node = pdfContentRef.current;
      if (!node) return;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fff9f8",
      });

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (node.offsetHeight * imgWidth) / node.offsetWidth;

      let heightLeft = imgHeight;
      let position = margin;

      doc.addImage(dataUrl, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        doc.addPage();
        doc.addImage(dataUrl, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight - margin * 2;
      }

      doc.save(`Demaa-Plan-Action-${new Date().toISOString().slice(0, 10)}.pdf`);
    })();
  };

  const generateCSV = () => {
    if (!result) return;

    const rows = [
      ["Priorite", "Action", "Pourquoi", "Mise en place", "Outil", "Effort", "Gain estime"],
      ...result.actions.map((action, index) => [
        String(index + 1),
        action.title,
        action.why,
        action.how,
        action.tool,
        action.effort,
        action.time_gain,
      ]),
    ];

    const csvContent = "\uFEFF" + rows.map((row) => row.map(escapeCSV).join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Demaa-Plan-Excel-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const focusHomeChat = () => {
    homeTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      homeTextareaRef.current?.focus();
    }, 250);
  };

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-12 md:py-[4.25rem]">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-[38rem] -z-10 h-72 w-72 rounded-full bg-brand-blue/5 blur-3xl" />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-brand-blue backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_38%)]" />
            <div className="relative h-full w-full flex items-center justify-center px-6">
              <div className="max-w-2xl text-center text-white">
                <div className="min-h-[170px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeQuoteIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <p className="demaa-section-title text-2xl leading-[1.08] tracking-tight text-white md:text-[2.8rem]">
                        {LOADING_QUOTES[activeQuoteIndex].text}
                      </p>
                      <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/55">
                        {LOADING_QUOTES[activeQuoteIndex].author}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFreeTrialModal && (
          <DelegationPricingModal
            isOpen={showFreeTrialModal}
            onClose={() => setShowFreeTrialModal(false)}
            initialOffer="free"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 bg-brand-blue/55 backdrop-blur-sm px-4"
          >
            <div className="h-full w-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-[2rem] p-7 md:p-8 shadow-[0_30px_80px_rgba(21,36,69,0.18)] border border-black/5 relative"
              >
                {!pendingResult && (
                  <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 text-gray-300 hover:text-brand-blue transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-brand-blue tracking-tight">
                      Recevez votre plan
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      Entrez votre email pour voir le plan et le retrouver plus facilement ensuite.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                  <div>
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      placeholder="vous@entreprise.fr"
                      className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50/70 text-brand-blue font-medium focus:outline-none focus:border-brand-blue/25 focus:bg-white"
                    />
                  </div>

                  {emailError && (
                    <div className="text-sm font-semibold text-red-500">{emailError}</div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-brand-blue text-white font-black hover:bg-brand-coral transition-colors"
                  >
                    Voir mon plan
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 space-y-20 md:mt-12 md:space-y-32"
          >
            <motion.section {...SECTION_REVEAL} className="flex flex-col items-center text-center space-y-7">
              <div className="space-y-4">
                <h1 className="demaa-hero-title text-[3rem] text-brand-blue tracking-tight leading-[0.98] md:text-[4.05rem] lg:text-[5rem]">
                  Vous avez déjà assez à gérer.
                  <br className="hidden md:block" />
                  <span className="text-brand-coral"> Le reste, on peut l&apos;automatiser.</span>
                </h1>
                <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-500 md:text-lg md:leading-relaxed">
                  On identifie avec vous ce qui vous fait perdre du temps, puis on met en place des automatisations simples, utiles et adaptées à votre façon de travailler.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="relative mt-4 w-full max-w-4xl group">
                <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_10px_30px_rgba(34,48,84,0.05)] transition-all duration-300 group-focus-within:border-brand-blue/10 group-focus-within:shadow-[0_16px_40px_rgba(34,48,84,0.08)]">
                  <textarea
                    ref={homeTextareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();

                        if (!isLoading && inputValue.trim()) {
                          void handleSubmit(e as unknown as React.FormEvent);
                        }
                      }
                    }}
                    placeholder="Décrivez les tâches qui vous prennent du temps"
                    className="h-36 w-full resize-none bg-transparent p-7 pr-7 text-lg font-normal leading-relaxed placeholder:text-base placeholder:font-light placeholder:text-gray-300 focus:outline-none md:pr-56"
                    disabled={isLoading}
                  />

                  <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4 md:absolute md:bottom-6 md:right-6 md:border-t-0 md:bg-transparent md:p-0">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        disabled={isLoading || generationLimitReached}
                        aria-label={isRecording ? "Arrêter la note vocale" : "Démarrer la note vocale"}
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                          isLoading || generationLimitReached
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : isRecording
                              ? "bg-brand-coral text-white"
                              : "bg-gray-100 text-brand-blue hover:bg-gray-200"
                        }`}
                      >
                        <Mic className="h-4 w-4" />
                      </button>

                      {!generationLimitReached && (
                        <button
                          type="submit"
                          disabled={isLoading || !inputValue.trim()}
                          aria-label={isLoading ? "Analyse en cours" : "Estimer les heures à gagner"}
                          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 md:h-12 md:px-6 ${
                            isLoading || !inputValue.trim()
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "bg-brand-blue text-white hover:bg-brand-coral"
                          }`}
                        >
                          <span>Estimer les heures à gagner</span>
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {generationLimitReached && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={navigateToPricing}
                      className="inline-flex items-center justify-center rounded-full bg-brand-blue px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-brand-coral"
                    >
                      Déléguer mes automatisations
                    </button>
                  </div>
                )}

                {hasUnlockedPlan && emailValue.trim() && (
                  <div className="mt-4 text-sm text-gray-400 font-light">
                    {generationLimitReached
                      ? "Vous avez atteint 3 plans sur cette adresse email."
                      : `${Math.max(0, MAX_GENERATIONS_PER_USER - generationCount)} plan${
                          Math.max(0, MAX_GENERATIONS_PER_USER - generationCount) > 1 ? "s" : ""
                        } restant${Math.max(0, MAX_GENERATIONS_PER_USER - generationCount) > 1 ? "s" : ""}.`}
                  </div>
                )}

                {error && (
                  <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
              </form>
            </motion.section>

            <motion.section {...SECTION_REVEAL} className="space-y-10 md:space-y-12">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  On commence par remettre les choses à plat
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  On avance simplement, avec vous, pour construire quelque chose d&apos;utile dès le départ. Pas une usine à gaz. Pas un système impossible à reprendre.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {HOME_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[1.75rem] border border-black/5 bg-white/90 px-5 py-6 shadow-[0_8px_18px_rgba(25,27,48,0.018)] md:px-6"
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
            </motion.section>

            <motion.section {...SECTION_REVEAL} className="space-y-10 md:space-y-12">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  Les tâches évitées deviennent des systèmes qui tournent
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Ce sont souvent ces petits trous dans le quotidien qui coûtent le plus cher : un lead non relancé, un client mal onboardé, un rapport oublié. Voilà ce que ça donne quand on les structure.
                </p>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-brand-blue/10 bg-white shadow-[0_8px_18px_rgba(25,27,48,0.016)]">
                <div className="hidden grid-cols-[1.05fr_1.25fr_1.25fr] gap-5 bg-brand-blue/[0.025] px-6 py-5 text-sm font-medium md:grid">
                  <div className="text-brand-blue">Processus</div>
                  <div className="text-brand-coral">Aujourd&apos;hui</div>
                  <div className="text-brand-blue">Une fois automatisé</div>
                </div>

                <div>
                  {HOME_TRANSFORMATION_EXAMPLES.map((item) => (
                    <div
                      key={item.process}
                      className="grid gap-5 px-5 py-7 text-left transition-colors hover:bg-brand-blue/[0.018] md:grid-cols-[1.05fr_1.25fr_1.25fr] md:px-6 md:py-8"
                    >
                      <div>
                        <h3 className="text-lg font-medium leading-snug text-brand-blue md:text-xl">
                          {item.process}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-gray-500 md:text-[0.95rem]">
                          {item.context}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-brand-coral/15 bg-brand-coral/[0.045] px-4 py-4 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-brand-coral md:hidden">
                          Aujourd&apos;hui
                        </div>
                        <p className="text-sm font-light leading-relaxed text-brand-coral md:text-base">
                          {item.before}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-brand-blue/10 bg-brand-blue/[0.035] px-4 py-4 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0">
                        <div className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-brand-blue md:hidden">
                          Une fois automatisé
                        </div>
                        <p className="text-sm font-light leading-relaxed text-brand-blue md:text-base">
                          {item.after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section {...SECTION_REVEAL} id="pricing" className="scroll-mt-24 space-y-10 md:space-y-12">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  Vous choisissez votre point de départ
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Vous pouvez commencer petit pour tester, ou prendre plus de marge si vous avez déjà plusieurs besoins à automatiser.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {HOME_OFFERS.map((offer) => (
                  <div
                    key={offer.title}
                    className={`grid h-full grid-rows-[auto_auto_1fr_auto_auto] rounded-[1.75rem] border p-6 shadow-[0_8px_18px_rgba(25,27,48,0.018)] md:p-7 ${
                      offer.featured
                        ? "border-brand-coral/10 bg-[#FFF3EF]"
                        : "border-black/5 bg-white/90"
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
                          <span className="mt-[0.42rem] h-2.5 w-2.5 rounded-full bg-brand-coral/45" />
                          <p className="m-0 text-[0.82rem] font-light leading-relaxed text-gray-500">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 border-t border-black/5 pt-4">
                      <div className="grid min-h-[3rem] items-center gap-2 sm:grid-cols-[auto_1fr]">
                        <div className="demaa-section-title text-[1.85rem] leading-none tracking-tight text-brand-blue">
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
                        offer.action === "modal"
                          ? setShowFreeTrialModal(true)
                          : offer.href && navigateToHref(router, offer.href)
                      }
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-coral"
                    >
                      {offer.cta}
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section {...SECTION_REVEAL} className="space-y-10 rounded-[2.25rem] border border-brand-coral/10 bg-brand-coral/6 px-5 py-8 md:space-y-12 md:px-8 md:py-10">
              <div className="mx-auto max-w-4xl space-y-4 text-center">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  De quoi dépend le niveau d&apos;accompagnement ?
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Toutes les automatisations ne demandent pas le même travail. Certaines sont très simples à mettre en place. D&apos;autres demandent plus d&apos;outils, plus de logique ou plus de vérifications.
                </p>
              </div>

              <div className="mx-auto max-w-5xl space-y-3">
                {HOME_CREDIT_EXAMPLES.map((example, index) => {
                  const isOpen = openHomeCreditExample === index;

                  return (
                    <div
                      key={example.title}
                      className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-white text-left shadow-[0_8px_18px_rgba(25,27,48,0.016)]"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenHomeCreditExample(isOpen ? -1 : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-base font-medium tracking-tight text-brand-blue md:text-lg">
                            {example.title}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-[#FFF3EF] px-3 py-1 text-sm font-medium text-brand-coral">
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
                        <div className="border-t border-black/5 px-5 py-4 md:px-6">
                          <p className="mb-4 text-sm font-light leading-relaxed text-gray-500">
                            {example.subtitle}
                          </p>
                          <div className="space-y-3">
                            {example.items.map((item) => (
                              <div
                                key={item}
                                className="grid grid-cols-[0.75rem_1fr] items-start gap-x-3"
                              >
                                <span className="mt-[0.42rem] h-2.5 w-2.5 rounded-full bg-brand-coral/45" />
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
            </motion.section>

            <motion.section {...SECTION_REVEAL} className="space-y-10 md:space-y-12">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  Vous gardez la main, même quand on automatise
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  L&apos;idée n&apos;est pas juste d&apos;automatiser une tâche. L&apos;idée, c&apos;est que ça tourne bien, que ce soit clair, et que vous sachiez où vous mettez les pieds.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {HOME_INCLUDED_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-black/5 bg-white/85 px-5 py-5 text-left shadow-[0_8px_18px_rgba(25,27,48,0.016)]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-coral shadow-[0_4px_10px_rgba(16,24,40,0.04)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-base font-semibold text-brand-blue">{item.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            <motion.section {...SECTION_REVEAL} className="rounded-[2.25rem] border border-black/5 bg-white px-6 py-12 text-center shadow-[0_8px_18px_rgba(25,27,48,0.016)] md:px-10 md:py-16">
              <div className="mx-auto max-w-3xl space-y-4">
                <h2 className="demaa-section-title text-[2.6rem] leading-[0.98] tracking-tight text-brand-blue md:text-[4.2rem]">
                  Commencez par la tâche qui vous épuise le plus
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Décrivez vos tâches répétitives, vos relances, vos copier-coller ou vos suivis manuels. On vous aide à voir ce qui peut être automatisé et combien de temps vous pourriez récupérer.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={focusHomeChat}
                    className="inline-flex items-center justify-center rounded-full bg-brand-blue px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-coral"
                  >
                    Estimer les heures à gagner
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.div
            key="results-section"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div ref={pdfContentRef} className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-full bg-brand-coral/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-coral">
                      {buildHoursRecap(result.actions)}
                    </div>
                    <h2 className="demaa-section-title text-[2.45rem] tracking-tight text-brand-blue md:text-[4.05rem]">
                      Votre plan d&apos;action
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 md:pt-4">
                    <button
                      type="button"
                      onClick={generateCSV}
                      aria-label="Exporter en Excel"
                      title="Exporter en Excel"
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-brand-blue transition-all hover:bg-gray-200"
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={generatePDF}
                      aria-label="Exporter en PDF"
                      title="Exporter en PDF"
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-brand-blue transition-all hover:bg-gray-200"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm md:text-base text-brand-blue/80 font-semibold leading-relaxed">
                  {result.goal}
                </p>
                <p className="text-gray-500 leading-relaxed max-w-3xl">{result.summary}</p>
              </div>

              <div className="space-y-4">
                {result.actions.map((action, index) => (
                  <motion.div
                    key={`${action.title}-${index}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 + 0.08 }}
                    className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-medium text-sm shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-3 min-w-0">
                        <h3 className="text-2xl font-medium text-brand-blue tracking-tight">
                          {action.title}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.45fr_0.8fr] gap-4">
                      <div className="rounded-[1.5rem] bg-[#FFF9F8] border border-brand-coral/10 p-5">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-coral mb-3">
                          Mise en place
                        </div>
                        <p className="text-gray-700 leading-relaxed">{action.how}</p>
                      </div>

                      <div className="rounded-[1.5rem] bg-gray-50 border border-gray-100 p-5 space-y-4">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2">
                            Outil conseillé
                          </div>
                          <div className="text-sm md:text-[15px] font-medium text-gray-400 leading-relaxed">
                            {action.tool}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2">
                            Gain estimé
                          </div>
                          <div className="text-sm md:text-[15px] font-medium text-gray-400 leading-relaxed">
                            {withEstimationLabel(action.time_gain)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center pt-2 pb-12">
              <button
                onClick={() => {
                  setResult(null);
                  setPendingResult(null);
                  setInputValue("");
                  setError(null);
                }}
                className="group flex items-center gap-2 mx-auto text-gray-400 hover:text-brand-blue font-black text-xs uppercase tracking-widest transition-all"
              >
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Nouvelles tâches à automatiser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
