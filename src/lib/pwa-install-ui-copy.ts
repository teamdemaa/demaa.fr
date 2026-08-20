import { defineLocaleDictionary } from "@/lib/international-publication";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = defineLocaleDictionary({
  fr: {
    install: "Installer Demaa",
    later: "Plus tard",
    iosHelp: "Dans Safari, touchez Partager, puis « Sur l’écran d’accueil ».",
  },
  en: {
    install: "Install Demaa",
    later: "Later",
    iosHelp: "In Safari, tap Share, then “Add to Home Screen”.",
  },
});

export function getPwaInstallUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
