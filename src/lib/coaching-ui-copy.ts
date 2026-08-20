import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = {
  fr: {
    talk: "Échanger", talkLabel: "Échanger avec l’équipe Demaa", closeTalk: "Fermer la page Échanger", opening: "Ouverture…", close: "Fermer",
    accessTitle: "Écrire à l’équipe Demaa", signInTitle: "Connectez-vous pour envoyer", prepareAccessError: "Impossible de préparer l’accès à Échanger.", savePlanError: "Impossible de sauvegarder le plan.",
    title: "Clarifier ma situation", description: "Décrivez votre situation. L’équipe Demaa vous répond ici.", conversation: "Votre conversation", history: "Historique de la conversation", loading: "Chargement de la conversation…", you: "Vous", team: "Équipe Demaa",
    messageLabel: "Votre message", messagePlaceholder: "Décrivez la situation que vous souhaitez clarifier…", dictate: "Dicter le message", stopDictation: "Arrêter la dictée", send: "Clarifier ma situation", firstFree: "Ce premier échange est gratuit.", sendError: "Le message n’a pas été envoyé. Réessayez.", draftError: "Le brouillon n’a pas pu être préparé.",
    ongoing: "Besoin d’un accompagnement régulier ?", ongoingDescription: "Un accompagnement mensuel pour faire évoluer votre entreprise, prendre du recul et avancer avec un interlocuteur régulier.", meetings: "Deux rendez-vous individuels de 60 minutes par mois", followUp: "Un suivi entre les rendez-vous", price: "750 € HT / mois", discover: "Découvrir Coach business", completedDescription: "Coach business vous aide à faire avancer vos priorités dans la durée.",
  },
  en: {
    talk: "Talk to us", talkLabel: "Talk to the Demaa team", closeTalk: "Close Talk to us", opening: "Opening…", close: "Close",
    accessTitle: "Write to the Demaa team", signInTitle: "Sign in to send", prepareAccessError: "Unable to prepare access to Talk to us.", savePlanError: "Unable to save the plan.",
    title: "Clarify my situation", description: "Describe your situation. The Demaa team will reply here.", conversation: "Your conversation", history: "Conversation history", loading: "Loading the conversation…", you: "You", team: "Demaa team",
    messageLabel: "Your message", messagePlaceholder: "Describe the situation you would like to clarify…", dictate: "Dictate the message", stopDictation: "Stop dictation", send: "Clarify my situation", firstFree: "Your first exchange is free.", sendError: "The message was not sent. Try again.", draftError: "The draft could not be prepared.",
    ongoing: "Need ongoing support?", ongoingDescription: "Monthly support to develop your business, step back from day-to-day pressure and move forward with a regular thinking partner.", meetings: "Two individual 60-minute meetings each month", followUp: "Follow-up between meetings", price: "€750 excl. VAT / month", discover: "Discover Business coaching", completedDescription: "Business coaching helps you move your priorities forward over time.",
  },
} as const;

export function getCoachingUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
