"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
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

const HOME_COMPLEXITY_LEVELS = [
  {
    title: "Besoin simple",
    description:
      "Par exemple : envoyer une alerte WhatsApp quand un formulaire est rempli, relancer un rendez-vous automatiquement, ou ajouter des réponses dans un tableau de suivi.",
  },
  {
    title: "Besoin intermédiaire",
    description:
      "Par exemple : qualifier un prospect, l'envoyer dans le bon outil, générer un devis, ou déclencher plusieurs actions dans le bon ordre.",
  },
  {
    title: "Besoin plus complet",
    description:
      "Par exemple : construire un parcours de bout en bout avec plusieurs outils, plusieurs étapes, des conditions, des documents ou des relances automatiques.",
  },
] as const;

const HOME_OFFERS = [
  {
    badge: "2 crédits offerts",
    title: "Tester gratuitement",
    description:
      "2 crédits offerts pour cadrer votre besoin et lancer une première automatisation simple.",
    cta: "Tester gratuitement",
    action: "modal" as const,
    featured: true,
  },
  {
    badge: "10 crédits",
    title: "Pack de départ",
    description:
      "Pour commencer à structurer plusieurs tâches sans vous engager dans un abonnement.",
    cta: "Voir l'offre",
    action: "link" as const,
    href: "/deleguer-mes-automatisations",
  },
  {
    badge: "20 crédits",
    title: "Pack intensif",
    description:
      "Pour les activités qui ont déjà plusieurs sujets à automatiser et veulent avancer plus vite.",
    cta: "Voir l'offre",
    action: "link" as const,
    href: "/deleguer-mes-automatisations",
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
  const [generationCount, setGenerationCount] = useState(0);
  const [generationLimitReached, setGenerationLimitReached] = useState(false);

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
      router.push("/deleguer-mes-automatisations");
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
    <div className="max-w-5xl mx-auto px-4 py-12">
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
                      <p className="text-xl md:text-[2.2rem] font-black tracking-tight leading-[1.12] text-white">
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
            className="mt-8 space-y-16 md:mt-12 md:space-y-24"
          >
            <section className="flex flex-col items-center text-center space-y-7">
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-brand-blue tracking-tight leading-[1.02] md:text-5xl lg:text-[3.85rem]">
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
                          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition-all duration-300 md:h-12 md:px-6 ${
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

                <div className="mt-4 text-sm text-gray-400 font-light">
                  Réponse rapide, sans jargon, avec des pistes concrètes selon votre activité.
                </div>

                {generationLimitReached && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => router.push("/deleguer-mes-automatisations")}
                      className="inline-flex items-center justify-center rounded-full bg-brand-blue px-7 py-3.5 text-sm font-black text-white transition-all hover:bg-brand-coral"
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
            </section>

            <section className="space-y-8 md:space-y-10">
              <div className="space-y-2 text-center">
                <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                  Comment ça marche ?
                </h2>
                <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                  On avance simplement, avec vous, pour construire quelque chose d&apos;utile dès le départ. Pas une usine à gaz. Pas un système impossible à reprendre.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {HOME_STEPS.map((item) => (
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

            <section className="space-y-8 md:space-y-10">
              <div className="space-y-2 text-center">
                <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                  Ce qu&apos;on prend en charge avec vous
                </h2>
                <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                  L&apos;idée n&apos;est pas juste d&apos;automatiser une tâche. L&apos;idée, c&apos;est que ça tourne bien, que ce soit clair, et que vous sachiez où vous mettez les pieds.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {HOME_INCLUDED_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-black/5 bg-brand-blue/5 px-5 py-5 text-left"
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
            </section>

            <section className="space-y-8 rounded-[2rem] bg-brand-coral/6 px-5 py-6 md:space-y-10 md:px-7 md:py-8">
              <div className="space-y-2 text-center">
                <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                  De quoi dépend le niveau d&apos;accompagnement ?
                </h2>
                <p className="mx-auto max-w-4xl text-sm leading-relaxed text-gray-500 md:text-base">
                  Toutes les automatisations ne demandent pas le même travail. Certaines sont très simples à mettre en place. D&apos;autres demandent plus d&apos;outils, plus de logique ou plus de vérifications.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {HOME_COMPLEXITY_LEVELS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-black/5 bg-white px-5 py-5 text-left"
                  >
                    <div className="text-base font-semibold tracking-tight text-brand-blue">
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm leading-relaxed text-gray-600">
                Le plus simple reste de nous décrire ce que vous faites aujourd&apos;hui. On vous aide ensuite à estimer ce qu&apos;il faut vraiment.
              </p>
            </section>

            <section className="space-y-8 md:space-y-10">
              <div className="space-y-2 text-center">
                <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                  Choisissez la façon de démarrer
                </h2>
                <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                  Vous pouvez commencer petit pour tester, ou prendre plus de marge si vous avez déjà plusieurs besoins à automatiser.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {HOME_OFFERS.map((offer) => (
                  <div
                    key={offer.title}
                    className={`grid h-full grid-rows-[auto_auto_1fr_auto] rounded-[1.75rem] border p-6 md:p-7 ${
                      offer.featured
                        ? "border-brand-coral/15 bg-brand-coral/5"
                        : "border-black/5 bg-white"
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                      {offer.badge}
                    </div>
                    <div className="mt-4 min-h-[4rem] space-y-1.5">
                      <div className="text-[1.2rem] leading-[1.08] font-semibold tracking-tight text-brand-blue">
                        {offer.title}
                      </div>
                      <p className="text-[0.92rem] font-light leading-relaxed text-gray-500">
                        {offer.description}
                      </p>
                    </div>
                    <div className="mt-5" />
                    <button
                      type="button"
                      onClick={() =>
                        offer.action === "modal"
                          ? setShowFreeTrialModal(true)
                          : router.push(offer.href)
                      }
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-black text-white transition-colors hover:bg-brand-coral"
                    >
                      {offer.cta}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white px-6 py-10 text-center md:px-10 md:py-14">
              <div className="mx-auto max-w-3xl space-y-4">
                <h2 className="text-[2rem] font-black tracking-tight text-brand-blue md:text-[2.9rem]">
                  Commencez par ce qui vous prend le plus d&apos;énergie
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Décrivez vos tâches répétitives, vos relances, vos copier-coller ou vos suivis manuels. On vous aide à voir ce qui peut être automatisé et combien de temps vous pourriez récupérer.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={focusHomeChat}
                    className="inline-flex items-center justify-center rounded-full bg-brand-blue px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-brand-coral"
                  >
                    Estimer les heures à gagner
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="results-section"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={generateCSV}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-brand-blue rounded-2xl font-black text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-brand-blue rounded-2xl font-black text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => router.push("/deleguer-mes-automatisations")}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue text-white rounded-xl font-black text-sm whitespace-nowrap hover:bg-brand-coral transition-all"
              >
                Déléguer mes automatisations
              </button>
            </div>

            <div ref={pdfContentRef} className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-brand-coral/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-coral">
                  {buildHoursRecap(result.actions)}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">
                  Votre plan d&apos;action
                </h2>
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
                      <div className="w-11 h-11 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-black text-sm shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-3 min-w-0">
                        <h3 className="text-2xl font-black text-brand-blue tracking-tight">
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
