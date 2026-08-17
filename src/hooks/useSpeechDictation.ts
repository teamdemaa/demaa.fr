"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechDictationResult = {
  0?: { transcript?: string };
};

type SpeechDictationResultList = {
  readonly length: number;
  [index: number]: SpeechDictationResult | undefined;
};

type SpeechDictationResultEvent = {
  results: SpeechDictationResultList;
};

type SpeechDictationErrorEvent = {
  error?: string;
};

export type SpeechDictationRecognition = {
  abort?: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechDictationErrorEvent) => void) | null;
  onresult: ((event: SpeechDictationResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechDictationRecognitionConstructor =
  new () => SpeechDictationRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechDictationRecognitionConstructor;
    webkitSpeechRecognition?: SpeechDictationRecognitionConstructor;
  }
}

const RESTART_DELAY_MS = 250;

export function getSpeechDictationErrorMessage(
  error?: string,
  language = "fr-FR",
) {
  const isEnglish = language.toLowerCase().startsWith("en");
  if (isEnglish) {
    const keyboardFallback = " You can continue with the keyboard.";
    switch (error) {
      case "not-allowed":
      case "service-not-allowed":
        return `Allow microphone access in your browser settings.${keyboardFallback}`;
      case "audio-capture":
        return `No microphone could be used.${keyboardFallback}`;
      case "language-not-supported":
      case "language-unavailable":
        return `English dictation is not available on this device.${keyboardFallback}`;
      case "network":
        return `Dictation was interrupted by a connection problem.${keyboardFallback}`;
      default:
        return `Voice dictation is not available here.${keyboardFallback}`;
    }
  }
  const keyboardFallback = " Vous pouvez continuer au clavier.";
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return `Autorisez l’accès au microphone dans les réglages de votre navigateur.${keyboardFallback}`;
    case "audio-capture":
      return `Aucun microphone disponible n’a pu être utilisé.${keyboardFallback}`;
    case "language-not-supported":
    case "language-unavailable":
      return `La dictée en français n’est pas disponible sur cet appareil.${keyboardFallback}`;
    case "network":
      return `La dictée a été interrompue par un problème de connexion.${keyboardFallback}`;
    default:
      return `La dictée vocale n’est pas disponible ici.${keyboardFallback}`;
  }
}

function appendTranscript(base: string, transcript: string, maxLength: number) {
  const normalizedTranscript = transcript.trim();
  if (!normalizedTranscript) return base.slice(0, maxLength);

  const separator = base && !/\s$/.test(base) ? " " : "";
  return `${base}${separator}${normalizedTranscript}`.slice(0, maxLength);
}

function readTranscript(results: SpeechDictationResultList) {
  const parts: string[] = [];
  for (let index = 0; index < results.length; index += 1) {
    const transcript = results[index]?.[0]?.transcript?.trim();
    if (transcript) parts.push(transcript);
  }
  return parts.join(" ");
}

export type SpeechDictationSession = {
  cancel: () => void;
  destroy: () => void;
  start: () => void;
  stop: () => void;
};

export function createSpeechDictationSession({
  Recognition,
  continuous,
  initialValue,
  interimResults,
  language,
  maxLength,
  onEnd,
  onError,
  onListeningChange,
  onText,
}: {
  Recognition: SpeechDictationRecognitionConstructor;
  continuous: boolean;
  initialValue: string;
  interimResults: boolean;
  language: string;
  maxLength: number;
  onEnd: () => void;
  onError: (message: string | null) => void;
  onListeningChange: (listening: boolean) => void;
  onText: (value: string) => void;
}): SpeechDictationSession {
  const recognition = new Recognition();
  let active = true;
  let ended = false;
  let shouldListen = false;
  let currentRunBase = initialValue.slice(0, maxLength);
  let latestValue = currentRunBase;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;

  const clearRestartTimer = () => {
    if (restartTimer === null) return;
    clearTimeout(restartTimer);
    restartTimer = null;
  };

  const finish = () => {
    if (ended) return;
    ended = true;
    active = false;
    shouldListen = false;
    clearRestartTimer();
    onListeningChange(false);
    onEnd();
  };

  const startRecognition = () => {
    if (!active || !shouldListen) return;
    try {
      recognition.start();
    } catch {
      onError(getSpeechDictationErrorMessage(undefined, language));
      finish();
    }
  };

  const restartRecognition = () => {
    if (!active || !shouldListen || restartTimer !== null) return;
    currentRunBase = latestValue;
    restartTimer = setTimeout(() => {
      restartTimer = null;
      startRecognition();
    }, RESTART_DELAY_MS);
  };

  recognition.lang = language;
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;
  recognition.onresult = (event) => {
    if (!active) return;
    const transcript = readTranscript(event.results);
    if (!transcript) return;
    latestValue = appendTranscript(currentRunBase, transcript, maxLength);
    onText(latestValue);
  };
  recognition.onerror = (event) => {
    if (!active) return;
    if (event.error === "aborted") return;
    if (event.error === "no-speech" && shouldListen && continuous) return;
    onError(getSpeechDictationErrorMessage(event.error, language));
    finish();
  };
  recognition.onend = () => {
    if (!active) return;
    if (shouldListen && continuous) {
      restartRecognition();
      return;
    }
    finish();
  };

  const cancel = () => {
    if (!active) return;
    shouldListen = false;
    clearRestartTimer();
    active = false;
    if (recognition.abort) recognition.abort();
    else recognition.stop();
    finish();
  };

  return {
    cancel,
    destroy: cancel,
    start() {
      if (!active || shouldListen) return;
      onError(null);
      shouldListen = true;
      onListeningChange(true);
      startRecognition();
    },
    stop() {
      if (!active) return;
      const wasWaitingToRestart = restartTimer !== null;
      shouldListen = false;
      clearRestartTimer();
      if (wasWaitingToRestart) {
        finish();
        return;
      }
      try {
        recognition.stop();
      } catch {
        finish();
      }
    },
  };
}

export function useSpeechDictation({
  continuous = false,
  interimResults = true,
  language = "fr-FR",
  maxLength = Number.MAX_SAFE_INTEGER,
  onChange,
  value,
}: {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const sessionRef = useRef<SpeechDictationSession | null>(null);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [onChange, value]);

  const cancel = useCallback(() => {
    sessionRef.current?.cancel();
    sessionRef.current = null;
  }, []);

  const stop = useCallback(() => {
    sessionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (sessionRef.current || typeof window === "undefined") return;

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError(getSpeechDictationErrorMessage("unsupported", language));
      return;
    }

    const session = createSpeechDictationSession({
      Recognition,
      continuous,
      initialValue: valueRef.current,
      interimResults,
      language,
      maxLength,
      onEnd: () => {
        if (sessionRef.current === session) sessionRef.current = null;
      },
      onError: setError,
      onListeningChange: setIsListening,
      onText: (nextValue) => {
        valueRef.current = nextValue;
        onChangeRef.current(nextValue);
      },
    });
    sessionRef.current = session;
    session.start();
  }, [continuous, interimResults, language, maxLength]);

  const toggle = useCallback(() => {
    if (sessionRef.current) stop();
    else start();
  }, [start, stop]);

  const handleValueChange = useCallback((nextValue: string) => {
    // Stop first so a late recognition event cannot replace a manual edit.
    cancel();
    valueRef.current = nextValue;
    setError(null);
    onChangeRef.current(nextValue);
  }, [cancel]);

  useEffect(() => () => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
  }, []);

  return {
    cancel,
    error,
    handleValueChange,
    isListening,
    start,
    stop,
    toggle,
  };
}
