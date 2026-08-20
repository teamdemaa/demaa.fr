import { defineLocaleDictionary } from "@/lib/international-publication";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = defineLocaleDictionary({
  fr: {
    packageLegend: "Choisissez le forfait à étudier",
    company: "Entreprise",
    companyError: "Indiquez le nom de votre entreprise.",
    phone: "Numéro WhatsApp",
    phonePlaceholder: "+33 6 12 34 56 78",
    phoneHelp: "Nous vous recontacterons sur WhatsApp, uniquement au sujet de cette demande.",
    phoneError: "Indiquez un numéro WhatsApp valide.",
    sending: "Envoi…",
    submit: "Envoyer ma demande",
    consent: (serviceName: string) => `En envoyant cette demande, vous acceptez que Demaa vous contacte sur WhatsApp au sujet de ${serviceName}.`,
    privacy: "Politique de confidentialité",
    success: "Demande reçue. Nous vous contacterons prochainement sur WhatsApp.",
    invalid: "Corrigez les champs signalés avant de réessayer.",
    failure: "La demande n’a pas pu être envoyée. Merci de réessayer.",
  },
  en: {
    packageLegend: "Choose the package to discuss",
    company: "Company",
    companyError: "Enter your company name.",
    phone: "Contact number",
    phonePlaceholder: "+44 20 1234 5678",
    phoneHelp: "We will only use this number to contact you about this request within 24 to 48 hours.",
    phoneError: "Enter a valid contact number.",
    sending: "Sending…",
    submit: "Send my request",
    consent: (serviceName: string) => `By sending this request, you agree that Demaa may contact you about ${serviceName}.`,
    privacy: "Privacy policy (in French)",
    success: "Request received. We will contact you within 24 to 48 hours.",
    invalid: "Correct the highlighted fields and try again.",
    failure: "Your request could not be sent. Please try again.",
  },
});

export function getServiceCallbackUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
