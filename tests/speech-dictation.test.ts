import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSpeechDictationSession,
  getSpeechDictationErrorMessage,
  type SpeechDictationRecognition,
} from "@/hooks/useSpeechDictation";

type ResultEvent = Parameters<
  NonNullable<SpeechDictationRecognition["onresult"]>
>[0];

class MockSpeechRecognition implements SpeechDictationRecognition {
  static latest: MockSpeechRecognition | null = null;
  static throwOnStart = false;

  abortCalls = 0;
  continuous = false;
  interimResults = false;
  lang = "";
  onend: (() => void) | null = null;
  onerror: SpeechDictationRecognition["onerror"] = null;
  onresult: SpeechDictationRecognition["onresult"] = null;
  startCalls = 0;
  stopCalls = 0;

  constructor() {
    MockSpeechRecognition.latest = this;
  }

  abort() {
    this.abortCalls += 1;
  }

  start() {
    this.startCalls += 1;
    if (MockSpeechRecognition.throwOnStart) throw new Error("start_failed");
  }

  stop() {
    this.stopCalls += 1;
  }

  emitEnd() {
    this.onend?.();
  }

  emitError(error: string) {
    this.onerror?.({ error });
  }

  emitResult(...transcripts: string[]) {
    const results = transcripts.map((transcript) => ({
      0: { transcript },
    }));
    this.onresult?.({ results } as unknown as ResultEvent);
  }
}

function getLatestRecognition() {
  const recognition = MockSpeechRecognition.latest;
  if (!recognition) throw new Error("mock_not_created");
  return recognition;
}

function setup(overrides: Partial<{
  continuous: boolean;
  initialValue: string;
  interimResults: boolean;
  maxLength: number;
}> = {}) {
  MockSpeechRecognition.latest = null;
  MockSpeechRecognition.throwOnStart = false;
  const text: string[] = [];
  const errors: Array<string | null> = [];
  const listening: boolean[] = [];
  let endCalls = 0;

  const session = createSpeechDictationSession({
    Recognition: MockSpeechRecognition,
    continuous: overrides.continuous ?? true,
    initialValue: overrides.initialValue ?? "Texte existant",
    interimResults: overrides.interimResults ?? true,
    language: "fr-FR",
    maxLength: overrides.maxLength ?? 4_000,
    onEnd: () => { endCalls += 1; },
    onError: (message) => errors.push(message),
    onListeningChange: (value) => listening.push(value),
    onText: (value) => text.push(value),
  });

  const recognition = getLatestRecognition();
  return { errors, getEndCalls: () => endCalls, listening, recognition, session, text };
}

describe("speech dictation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("configures recognition and renders interim transcription without duplication", () => {
    const { errors, listening, recognition, session, text } = setup();

    session.start();
    recognition.emitResult("bonjour");
    recognition.emitResult("bonjour Demaa");

    expect(recognition).toMatchObject({
      continuous: true,
      interimResults: true,
      lang: "fr-FR",
      startCalls: 1,
    });
    expect(errors).toEqual([null]);
    expect(listening).toEqual([true]);
    expect(text).toEqual([
      "Texte existant bonjour",
      "Texte existant bonjour Demaa",
    ]);
  });

  it("ignores late recognition results after a manual edit cancels the session", () => {
    const { getEndCalls, listening, recognition, session, text } = setup();

    session.start();
    recognition.emitResult("premier résultat");
    session.cancel();
    const manuallyEditedText = "Texte corrigé manuellement";
    recognition.emitResult("résultat tardif qui ne doit pas écraser");

    expect(manuallyEditedText).toBe("Texte corrigé manuellement");
    expect(text).toEqual(["Texte existant premier résultat"]);
    expect(recognition.abortCalls).toBe(1);
    expect(listening).toEqual([true, false]);
    expect(getEndCalls()).toBe(1);
  });

  it("stops cleanly and finalizes only once when recognition ends", () => {
    const { getEndCalls, listening, recognition, session } = setup();

    session.start();
    session.stop();
    recognition.emitEnd();
    recognition.emitEnd();

    expect(recognition.stopCalls).toBe(1);
    expect(listening).toEqual([true, false]);
    expect(getEndCalls()).toBe(1);
  });

  it("restarts after an unexpected browser end and preserves prior text", () => {
    vi.useFakeTimers();
    const { getEndCalls, listening, recognition, session, text } = setup();

    session.start();
    recognition.emitResult("première partie");
    recognition.emitEnd();

    expect(listening).toEqual([true]);
    expect(getEndCalls()).toBe(0);
    expect(recognition.startCalls).toBe(1);

    vi.advanceTimersByTime(250);
    recognition.emitResult("deuxième partie");

    expect(recognition.startCalls).toBe(2);
    expect(text).toEqual([
      "Texte existant première partie",
      "Texte existant première partie deuxième partie",
    ]);
  });

  it("keeps listening after a no-speech pause until the user stops", () => {
    vi.useFakeTimers();
    const { errors, getEndCalls, listening, recognition, session } = setup();

    session.start();
    recognition.emitError("no-speech");
    recognition.emitEnd();
    vi.advanceTimersByTime(250);

    expect(errors).toEqual([null]);
    expect(listening).toEqual([true]);
    expect(recognition.startCalls).toBe(2);
    expect(getEndCalls()).toBe(0);

    session.stop();
    recognition.emitEnd();
    vi.runAllTimers();

    expect(listening).toEqual([true, false]);
    expect(recognition.startCalls).toBe(2);
    expect(getEndCalls()).toBe(1);
  });

  it("stops immediately when the user acts during the restart delay", () => {
    vi.useFakeTimers();
    const { getEndCalls, listening, recognition, session } = setup();

    session.start();
    recognition.emitEnd();
    session.stop();
    vi.runAllTimers();

    expect(recognition.startCalls).toBe(1);
    expect(recognition.stopCalls).toBe(0);
    expect(listening).toEqual([true, false]);
    expect(getEndCalls()).toBe(1);
  });

  it("aborts on destroy and ignores subsequent events", () => {
    const { getEndCalls, recognition, session, text } = setup();

    session.start();
    session.destroy();
    recognition.emitResult("après démontage");
    recognition.emitError("network");

    expect(recognition.abortCalls).toBe(1);
    expect(text).toEqual([]);
    expect(getEndCalls()).toBe(1);
  });

  it.each([
    ["not-allowed", "Autorisez l’accès au microphone"],
    ["service-not-allowed", "Autorisez l’accès au microphone"],
    ["audio-capture", "Aucun microphone disponible"],
    ["language-not-supported", "dictée en français"],
    ["language-unavailable", "dictée en français"],
    ["network", "problème de connexion"],
    ["unknown", "dictée vocale n’est pas disponible"],
  ])("maps %s errors to an actionable keyboard fallback", (error, expected) => {
    const { errors, recognition, session } = setup();

    session.start();
    recognition.emitError(error);

    expect(errors.at(-1)).toContain(expected);
    expect(errors.at(-1)).toContain("continuer au clavier");
  });

  it("does not display an alert for an aborted recognition", () => {
    const { errors, recognition, session } = setup();

    session.start();
    recognition.emitError("aborted");

    expect(errors).toEqual([null]);
  });

  it("reports a start failure and resets listening", () => {
    const { errors, getEndCalls, listening, session } = setup();
    MockSpeechRecognition.throwOnStart = true;

    session.start();

    expect(errors.at(-1)).toContain("continuer au clavier");
    expect(listening).toEqual([true, false]);
    expect(getEndCalls()).toBe(1);
  });

  it("honors maximum input length", () => {
    const { recognition, session, text } = setup({
      initialValue: "12345",
      maxLength: 10,
    });

    session.start();
    recognition.emitResult("67890 suite");

    expect(text).toEqual(["12345 6789"]);
  });

  it("never creates or stores an audio stream", () => {
    const source = readFileSync("src/hooks/useSpeechDictation.ts", "utf8");

    expect(source).not.toContain("getUserMedia");
    expect(source).not.toContain("MediaRecorder");
    expect(source).not.toContain("Blob");
  });

  it("keeps both product surfaces on the shared dictation hook", () => {
    const actionPlan = readFileSync(
      "src/components/ActionPlanExperience.tsx",
      "utf8",
    );
    const generationBar = readFileSync(
      "src/components/ActionPlanGenerationBar.tsx",
      "utf8",
    );
    const uiCopy = readFileSync("src/lib/action-plan-ui-copy.ts", "utf8");
    const coaching = readFileSync("src/components/CoachingPanel.tsx", "utf8");

    expect(actionPlan).toContain("useSpeechDictation");
    expect(actionPlan).toContain("continuous: true");
    expect(generationBar).toContain("useSpeechDictation");
    expect(generationBar).toContain("continuous: true");
    expect(generationBar).toContain("situationDictation.handleValueChange");
    expect(generationBar).toContain("aria-label={situationDictation.isListening");
    expect(generationBar).toContain("copy.stopDictation");
    expect(generationBar).toContain("copy.dictate");
    expect(uiCopy).toContain('stopDictation: "Arrêter la dictée"');
    expect(uiCopy).toContain('dictate: "Dicter ma demande"');
    expect(generationBar).toContain('language: contentLocaleCode === "en" ? "en-GB" : "fr-FR"');
    expect(coaching).toContain("useSpeechDictation");
    expect(coaching).toContain("continuous: true");
    expect(`${actionPlan}\n${generationBar}\n${coaching}`).not.toContain("getUserMedia");
    expect(`${actionPlan}\n${generationBar}\n${coaching}`).not.toContain("new SpeechRecognition");
  });

  it("always gives an unavailable browser a keyboard fallback", () => {
    expect(getSpeechDictationErrorMessage("unsupported")).toContain(
      "continuer au clavier",
    );
  });
});
