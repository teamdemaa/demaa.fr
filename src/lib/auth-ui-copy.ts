import type { InterfaceLocaleCode } from "@/lib/international-context";

type AuthUiCopy = {
  access: {
    defaultChoiceTitle: string;
    emailTitle: string;
    createTitle: string;
    welcomeBackTitle: string;
    backToOptions: string;
    backToEmail: string;
    or: string;
    continueWithEmail: string;
    emailAddress: string;
    continue: string;
    edit: string;
    password: string;
    choosePassword: string;
    currentPassword: string;
    forgotPassword: string;
    signingIn: string;
    createAccess: string;
    signIn: string;
    alreadyHasAccount: string;
    needsAccount: string;
  };
  errors: {
    emailAlreadyUsed: string;
    invalidCredentials: string;
    weakPassword: string;
    tooManyRequests: string;
    signInIncomplete: string;
    invalidEmail: string;
    missingPassword: string;
    shortPassword: string;
    workspacePreparationFailed: string;
    missingResetEmail: string;
    googlePopupBlocked: string;
    googlePopupTimeout: string;
    googleUnauthorizedDomain: string;
    googleAccountUsesPassword: string;
    googleIncomplete: string;
    googleRedirectIncomplete: string;
    googleCallbackTimeout: string;
  };
  notices: {
    resetSent: string;
  };
  google: {
    continue: string;
    signingIn: string;
    interruptedTitle: string;
    retry: string;
    callbackTitle: string;
    callbackDescription: string;
  };
  page: {
    title: string;
    signInTitle: string;
    continueMessage: string;
    companyUnavailable: string;
    close: string;
    signOut: string;
    signingOut: string;
  };
};

const AUTH_UI_COPY = {
  fr: {
    access: {
      defaultChoiceTitle: "Accédez à votre espace",
      emailTitle: "Votre adresse e-mail",
      createTitle: "Créez votre accès",
      welcomeBackTitle: "Bon retour",
      backToOptions: "Retour aux options de connexion",
      backToEmail: "Retour à l’étape e-mail",
      or: "ou",
      continueWithEmail: "Continuer avec mon e-mail",
      emailAddress: "Adresse e-mail",
      continue: "Continuer",
      edit: "Modifier",
      password: "Mot de passe",
      choosePassword: "Choisissez un mot de passe",
      currentPassword: "Votre mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      signingIn: "Connexion…",
      createAccess: "Créer mon accès",
      signIn: "Se connecter",
      alreadyHasAccount: "Vous avez déjà un compte ?",
      needsAccount: "Vous n’avez pas encore de compte ?",
    },
    errors: {
      emailAlreadyUsed: "Un compte existe déjà avec cette adresse. Connectez-vous avec votre mot de passe.",
      invalidCredentials: "Adresse e-mail ou mot de passe incorrect.",
      weakPassword: "Ce mot de passe ne respecte pas la politique de sécurité Firebase.",
      tooManyRequests: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
      signInIncomplete: "La connexion n’a pas abouti.",
      invalidEmail: "Merci d'indiquer une adresse email valide.",
      missingPassword: "Indiquez votre mot de passe.",
      shortPassword: "Choisissez un mot de passe d’au moins 8 caractères.",
      workspacePreparationFailed: "Votre compte a été créé, mais votre espace n’a pas pu être préparé. Reconnectez-vous pour réessayer.",
      missingResetEmail: "Indiquez d’abord l’adresse e-mail de votre compte.",
      googlePopupBlocked: "La fenêtre Google a été bloquée. Réessayez pour continuer par redirection.",
      googlePopupTimeout: "La fenêtre Google n’a pas répondu. Réessayez pour continuer par redirection.",
      googleUnauthorizedDomain: "La connexion Google n’est pas encore autorisée sur ce domaine.",
      googleAccountUsesPassword: "Cette adresse utilise déjà un mot de passe. Connectez-vous avec votre e-mail.",
      googleIncomplete: "La connexion Google n’a pas pu aboutir.",
      googleRedirectIncomplete: "La connexion Google n’a pas été finalisée. Réessayez.",
      googleCallbackTimeout: "La connexion Google prend trop de temps. Réessayez.",
    },
    notices: {
      resetSent: "Si un compte correspond à cette adresse, les instructions ont été envoyées.",
    },
    google: {
      continue: "Continuer avec Google",
      signingIn: "Connexion…",
      interruptedTitle: "Connexion interrompue",
      retry: "Réessayer avec Google",
      callbackTitle: "Connexion avec Google",
      callbackDescription: "Finalisation de votre accès…",
    },
    page: {
      title: "Connexion à Demaa",
      signInTitle: "Connectez-vous",
      continueMessage: "Connectez-vous pour continuer.",
      companyUnavailable: "Votre session est valide, mais votre espace entreprise est indisponible. Utilisez un autre compte ou déconnectez-vous depuis l’application.",
      close: "Fermer",
      signOut: "Se déconnecter",
      signingOut: "Déconnexion…",
    },
  },
  en: {
    access: {
      defaultChoiceTitle: "Access your account",
      emailTitle: "Your email address",
      createTitle: "Create your access",
      welcomeBackTitle: "Welcome back",
      backToOptions: "Back to sign-in options",
      backToEmail: "Back to the email step",
      or: "or",
      continueWithEmail: "Continue with my email",
      emailAddress: "Email address",
      continue: "Continue",
      edit: "Edit",
      password: "Password",
      choosePassword: "Choose a password",
      currentPassword: "Your password",
      forgotPassword: "Forgot your password?",
      signingIn: "Signing in…",
      createAccess: "Create my access",
      signIn: "Sign in",
      alreadyHasAccount: "Already have an account?",
      needsAccount: "Don’t have an account yet?",
    },
    errors: {
      emailAlreadyUsed: "An account already exists for this address. Sign in with your password.",
      invalidCredentials: "Incorrect email address or password.",
      weakPassword: "This password does not meet the Firebase security policy.",
      tooManyRequests: "Too many attempts. Wait a few minutes before trying again.",
      signInIncomplete: "Sign-in was not completed.",
      invalidEmail: "Enter a valid email address.",
      missingPassword: "Enter your password.",
      shortPassword: "Choose a password with at least 8 characters.",
      workspacePreparationFailed: "Your account was created, but your workspace could not be prepared. Sign in to try again.",
      missingResetEmail: "Enter your account email address first.",
      googlePopupBlocked: "The Google window was blocked. Try again to continue by redirect.",
      googlePopupTimeout: "The Google window did not respond. Try again to continue by redirect.",
      googleUnauthorizedDomain: "Google sign-in is not yet authorised on this domain.",
      googleAccountUsesPassword: "This address already uses a password. Sign in with your email.",
      googleIncomplete: "Google sign-in could not be completed.",
      googleRedirectIncomplete: "Google sign-in was not completed. Try again.",
      googleCallbackTimeout: "Google sign-in is taking too long. Try again.",
    },
    notices: {
      resetSent: "If an account matches this address, the instructions have been sent.",
    },
    google: {
      continue: "Continue with Google",
      signingIn: "Signing in…",
      interruptedTitle: "Sign-in interrupted",
      retry: "Try again with Google",
      callbackTitle: "Signing in with Google",
      callbackDescription: "Finishing your sign-in…",
    },
    page: {
      title: "Sign in to Demaa",
      signInTitle: "Sign in",
      continueMessage: "Sign in to continue.",
      companyUnavailable: "Your session is valid, but your company space is unavailable. Sign in with another account or sign out from the application.",
      close: "Close",
      signOut: "Sign out",
      signingOut: "Signing out…",
    },
  },
} satisfies Record<InterfaceLocaleCode, AuthUiCopy>;

export function getAuthUiCopy(localeCode: InterfaceLocaleCode): AuthUiCopy {
  return AUTH_UI_COPY[localeCode];
}
