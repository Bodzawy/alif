import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 · Lektion 1 · the textbook page after "صَبَاحُ الْخَيْر": التَّحِيَّةُ فِي الصَّبَاحِ,
// تَقْدِيمُ النَّفْسِ and the three exercises. MOCKED here: the microphone
// (MediaRecorder), /api/tts (speakArabic) and the answer of /api/pronunciation
// (fetch). Real: the data, the rules / allowed targets, the letter search, the
// UI and the progress in localStorage.

vi.mock("@/lib/audio/wav", () => ({ blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFF"], { type: "audio/wav" })) }));
const tts = vi.hoisted(() => ({ speak: vi.fn(async (_text: string) => undefined) }));
vi.mock("@/lib/tts/player", () => ({ speakArabic: tts.speak, stopSpeaking: vi.fn(), speechUrl: vi.fn(async () => "blob:x") }));

import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import A1UnitPage from "@/app/a1/[unit]/page";
import { LetterFindStep } from "@/components/a1/letter-find/letter-find-step";
import { PhrasesStep } from "@/components/a1/phrases/phrases-step";
import { a1LessonExercises, a1StepKey, a1Unit1, getA1Lesson } from "@/data/a1";
import { menDialogue, womenDialogue } from "@/data/a1/sabah-al-khayr";
import { a1Tahiyya, majidFatimaDialogue } from "@/data/a1/tahiyya";
import type { A1Lesson } from "@/data/types";
import { checkFind, findLines, findWords, targetKeys } from "@/lib/arabic/letter-find";
import { getLessonProgress } from "@/lib/progress";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

type Step = A1Lesson["steps"][number];
const step = <K extends Step["kind"]>(slug: string, kind: K) => {
  const found = a1Tahiyya.steps.find((s) => s.slug === slug)!;
  if (found.kind !== kind) throw new Error(`${slug} must be ${kind}`);
  return found as Extract<Step, { kind: K }>;
};

afterEach(() => cleanup());

describe("placement: the entry right after صَبَاحُ الْخَيْر", () => {
  it("is the tenth entry of Lektion 1, directly after the conversations", () => {
    const slugs = a1Unit1.lessons.map((l) => l.slug);
    expect(slugs.indexOf("tahiyya-wa-taqdim")).toBe(slugs.indexOf("sabah-al-khayr") + 1);
    expect(slugs.at(-1)).toBe("tahiyya-wa-taqdim");
    expect(getA1Lesson("lesson-1", "tahiyya-wa-taqdim")).toBe(a1Tahiyya);
    expect(a1Tahiyya).toMatchObject({ kind: "phrase", label: "التَّحِيَّةُ وَتَقْدِيمُ النَّفْسِ", labelGerman: "Begrüßen und sich vorstellen" });
    // صَبَاحُ الْخَيْر itself is unchanged: two conversations (listen, repeat, role-play), then its letters.
    expect(getA1Lesson("lesson-1", "sabah-al-khayr")!.steps.map((s) => s.kind)).toEqual(["dialogue", "dialogue", "dialogue", "dialogue", "dialogue", "dialogue", "gaps"]);
  });

  it("six steps: greeting, introducing oneself, listening, then the book's three exercises", () => {
    expect(a1Tahiyya.steps.map((s) => [s.slug, s.kind, s.title])).toEqual([
      ["step-1", "phrases", "Begrüßung am Morgen"],
      ["step-2", "phrases", "Sich vorstellen"],
      ["step-3", "dialogue", "Anhören: Majid und Fatima"],
      ["step-4", "dialogue", "Übung 1: Rollenspiel"],
      ["step-5", "letter-find", "Übung 2: Finde ا"],
      ["step-6", "letter-find", "Übung 3: Finde ب"],
    ]);
    expect([step("step-3", "dialogue").mode, step("step-4", "dialogue").mode]).toEqual(["listen", "roleplay"]);
  });

  it("the last step of صَبَاحُ الْخَيْر leads on to the new entry; the unit lists it last", async () => {
    render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "sabah-al-khayr", step: "step-7" }) }));
    expect(screen.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-1/tahiyya-wa-taqdim");
    expect(screen.getByTestId("next-entry")).toHaveTextContent("Begrüßen und sich vorstellen");
    cleanup();
    render(await A1UnitPage({ params: Promise.resolve({ unit: "lesson-1" }) }));
    const entries = within(screen.getByTestId("unit-contents")).getAllByRole("link");
    expect(entries.at(-1)).toHaveAttribute("href", "/a1/lesson-1/tahiyya-wa-taqdim");
    expect(entries.at(-1)).toHaveTextContent("6 Schritte");
  });

  it("each exercise step shows the book's Arabic instruction and the German one", async () => {
    render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "tahiyya-wa-taqdim", step: "step-4" }) }));
    expect(screen.getByTestId("step-instruction-arabic")).toHaveTextContent("كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ أَوْ زَمِيلَتِكَ");
    expect(screen.getByTestId("step-instruction-german")).toHaveTextContent("Spiele den Dialog mit deinem Lernpartner nach und frage nach seinem oder ihrem Namen.");
    expect(screen.getByTestId("step-instruction-note")).toHaveTextContent("Dein Lernpartner ist hier die App");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 4 von 6");
    cleanup();
    for (const [slug, text] of [["step-5", "حَرْفِ الْأَلِفِ"], ["step-6", "حَرْفِ الْبَاءِ"]] as const) {
      render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "tahiyya-wa-taqdim", step: slug }) }));
      expect(screen.getByTestId("step-instruction-arabic")).toHaveTextContent(text);
      expect(screen.getByTestId("step-instruction-german")).toHaveTextContent("Lies den Dialog und unterstreiche");
      cleanup();
    }
  });
});

describe("content: Arabic, transliteration, German, masculine and feminine", () => {
  it("التَّحِيَّةُ فِي الصَّبَاحِ: the greeting and its answer, then how are you (to a man / to a woman) and the answer", () => {
    const groups = step("step-1", "phrases").groups;
    expect(groups.map((g) => g.items.map((i) => [i.arabic, i.transliteration, i.german, i.gender ?? null]))).toEqual([
      [
        ["صَبَاحُ الْخَيْرِ", "Ṣabāḥu l-khayri", "Guten Morgen!", null],
        ["صَبَاحُ النُّورِ", "Ṣabāḥu n-nūri", "Guten Morgen!", null],
      ],
      [
        ["كَيْفَ حَالُكَ؟", "Kayfa ḥāluka?", "Wie geht es dir?", "m"],
        ["كَيْفَ حَالُكِ؟", "Kayfa ḥāluki?", "Wie geht es dir?", "f"],
        ["بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank.", null],
      ],
    ]);
    const [m, f] = groups[1]!.items;
    // Only the last vowel differs: fatha (ـَ) to a man, kasra (ـِ) to a woman.
    expect(m!.arabic.replace("؟", "").at(-1)).toBe("َ");
    expect(f!.arabic.replace("؟", "").at(-1)).toBe("ِ");
    expect([m!.tag, f!.tag]).toEqual(["zu einem Mann", "zu einer Frau"]);
  });

  it("تَقْدِيمُ النَّفْسِ: أَنَا مَاجِدٌ. / وَأَنَا فَاطِمَةُ.", () => {
    expect(step("step-2", "phrases").groups.flatMap((g) => g.items.map((i) => [i.arabic, i.transliteration, i.german]))).toEqual([
      ["أَنَا مَاجِدٌ.", "Ana Mājidun.", "Ich heiße Majid."],
      ["وَأَنَا فَاطِمَةُ.", "Wa-ana Fāṭimatu.", "Und ich heiße Fatima."],
    ]);
  });

  it("Übung 1: Majid speaks to a woman (حَالُكِ، وَأَنْتِ), Fatima to a man (حَالُكَ، اسْمُكَ); both ask for the name", () => {
    const d = majidFatimaDialogue;
    expect(d.speakers.map((s) => [s.id, s.name, s.voice])).toEqual([
      ["majid", "Majid", "male-1"],
      ["fatima", "Fatima", "female-2"],
    ]);
    expect(d.lines.map((l) => [l.speaker, l.arabic])).toEqual([
      ["majid", "صَبَاحُ الْخَيْرِ."],
      ["fatima", "صَبَاحُ النُّورِ."],
      ["majid", "كَيْفَ حَالُكِ؟"],
      ["fatima", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ."],
      ["fatima", "كَيْفَ حَالُكَ؟"],
      ["majid", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ."],
      ["fatima", "مَا اسْمُكَ؟"],
      ["majid", "أَنَا مَاجِدٌ، وَأَنْتِ؟"],
      ["fatima", "وَأَنَا فَاطِمَةُ."],
    ]);
    for (const line of d.lines) expect(line.german, line.id).toMatch(/^[A-ZÄÖÜ][^؀-ۿ]*$/);
  });

  it("every expression is evaluated by the existing rules; every model text may be spoken by /api/tts", () => {
    const exercises = a1LessonExercises(a1Tahiyya);
    expect(new Set(exercises.map((e) => e.target))).toEqual(new Set(["صباح الخير", "صباح النور", "كيف حالك", "بخير الحمد لله", "أنا ماجد", "وأنا فاطمة", "ما اسمك", "أنا ماجد وأنت"]));
    for (const e of exercises) {
      expect(CONDITION_RULES[e.target]?.excellent, e.target).toBeDefined();
      expect(isAllowedTarget(e.target), e.target).toBe(true);
      expect(isAllowedTtsText(e.modelText), e.modelText).toBe(true);
    }
    // Masculine and feminine "how are you" share one target: the evaluation hears the consonants, not the last vowel.
    expect(CONDITION_RULES["كيف حالك"]!.excellent!.conditions).toContain("iqra_phonemes contains ['k','y','f','H','l']");
    expect(CONDITION_RULES["أنا ماجد"]!.excellent!.conditions).toContain("iqra_phonemes contains ['n','m','j','d']");
    expect(CONDITION_RULES["وأنا فاطمة"]!.excellent!.conditions).toContain("iqra_phonemes contains ['w','n','f','T','m']");
  });
});

describe("the letter search (Übung 2 and 3)", () => {
  it("Übung 2 uses Ahmad and Ali's conversation unchanged: 14 Alifs (ا أ – also the ا of ال and اسم); the dagger alif of لِلَّهِ does not count", () => {
    const find = step("step-5", "letter-find").find;
    expect(find.dialogue).toBe(menDialogue);
    const lines = findLines(find.dialogue.lines, find.accepts);
    const perLine = lines.map((l) => l.words.flatMap((w) => w.tiles.filter((t) => t.target).map((t) => t.letter)).join(""));
    expect(perLine).toEqual(["اا", "اا", "ا", "ا", "اا", "أاأ", "أاأ"]);
    expect(targetKeys(lines)).toHaveLength(14);
    const lillah = findWords("x", "لِلَّهِ.", find.accepts)[0]!;
    expect(lillah.tiles.map((t) => t.letter)).toEqual(["ل", "ل", "ه"]);
    expect(lillah.trailing).toBe(".");
  });

  it("Übung 3 uses Nabila and Fatima's conversation unchanged: 4 × ب (صباح twice, بخير, نبيلة) – not ت ث ن ي", () => {
    const find = step("step-6", "letter-find").find;
    expect(find.dialogue).toBe(womenDialogue);
    const lines = findLines(find.dialogue.lines, find.accepts);
    expect(targetKeys(lines)).toHaveLength(4);
    const nabila = findWords("x", "نَبِيلَةُ.", ["ب"])[0]!;
    expect(nabila.tiles.map((t) => [t.letter, t.target])).toEqual([["ن", false], ["ب", true], ["ي", false], ["ل", false], ["ة", false]]);
  });

  it("checkFind: right, wrong and missing marks", () => {
    const lines = findLines([{ id: "l", arabic: "صَبَاحُ" }], ["ب"]);
    const ba = targetKeys(lines)[0]!;
    expect(checkFind(lines, new Set())).toMatchObject({ correct: [], wrong: [], missing: [ba], done: false });
    expect(checkFind(lines, new Set(["l:0:0", ba]))).toMatchObject({ correct: [ba], wrong: ["l:0:0"], done: false });
    expect(checkFind(lines, new Set([ba])).done).toBe(true);
  });
});

describe("LetterFindStep", () => {
  const KEY = "a1/lesson-1/tahiyya-wa-taqdim/step-6";
  beforeEach(() => window.localStorage.clear());

  it("the dialogue as real Arabic text; wrong marks are named, can be removed; all four ب → done and saved", () => {
    const find = step("step-6", "letter-find").find;
    render(<LetterFindStep find={find} progressKey={KEY} />);
    expect(screen.getByTestId("find-goal")).toHaveTextContent("Finde alle 4");
    expect(screen.getByTestId(`find-line-${womenDialogue.lines[6]!.id}`)).toHaveTextContent("وَأَنَا نَبِيلَةُ.");
    const tiles = screen.getAllByRole("button").filter((b) => b.dataset.testid?.startsWith("find-tile-"));
    const targets = tiles.filter((b) => b.dataset.target === "true");
    const nun = tiles.find((b) => b.getAttribute("aria-label")!.endsWith(": نَ") && b.dataset.target === "false")!;
    expect(targets).toHaveLength(4);

    fireEvent.click(targets[0]!);
    fireEvent.click(nun);
    expect(nun).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByTestId("find-check"));
    expect(screen.getByTestId("find-feedback")).toHaveTextContent("1 von 4 richtig. Es fehlen noch 3.");
    expect(screen.getByTestId("find-wrong")).toHaveTextContent("ن ist kein ب");
    expect(nun).toHaveAttribute("data-tone", "wrong");
    expect(targets[0]).toHaveAttribute("data-tone", "correct");
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();

    // Help: the missing ones are shown; then corrected.
    fireEvent.click(screen.getByTestId("find-reveal"));
    expect(targets[1]).toHaveAttribute("data-tone", "missing");
    fireEvent.click(nun);
    for (const t of targets.slice(1)) fireEvent.click(t);
    fireEvent.click(screen.getByTestId("find-check"));
    expect(screen.getByTestId("find-done")).toHaveTextContent("Du hast alle 4 gefunden");
    expect(screen.getByTestId("step-completed")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    expect(targets[0]).toBeDisabled();
  });
});

describe("PhrasesStep (mocked microphone and evaluation)", () => {
  const KEY = a1StepKey(a1Unit1, a1Tahiyya, "step-2");
  class FakeRecorder {
    state: "inactive" | "recording" = "inactive";
    mimeType = "audio/webm";
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["audio"]) });
      this.onstop?.();
    }
  }
  let verdicts: boolean[] = [];
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const target = (init!.body as FormData).get("target");
    const passed = verdicts.shift() ?? true;
    const rule = passed ? "excellent" : "said_wrong_sound";
    return {
      ok: true,
      status: 200,
      json: async () => ({ target, recognized: target, passed, failureReason: passed ? null : "rule_not_matched", scores: { accuracy: passed ? 92 : 75 }, feedback: { rule, message: "" }, details: {}, conditionEvaluation: { target, azureAccuracy: passed ? 92 : 75, iqraPhonemes: ["a"], matchedRule: rule, message: "", conditions: [] }, discrimination: {}, words: [] }),
    };
  });
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function record(id: string) {
    fireEvent.click(screen.getByTestId(`exercise-${id}-record`));
    await waitFor(() => expect(screen.getByTestId(`exercise-${id}`).dataset.phase).toBe("recording"));
    await act(() => wait(450));
    fireEvent.click(screen.getByTestId(`exercise-${id}-record`));
    await waitFor(() => expect(screen.getByTestId(`exercise-${id}`).dataset.phase).toBe("result"));
  }

  beforeEach(() => {
    window.localStorage.clear();
    verdicts = [];
    fetchMock.mockClear();
    tts.speak.mockClear();
    Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] })) }, configurable: true });
    vi.stubGlobal("MediaRecorder", FakeRecorder);
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("listen, record, feedback; a wrong attempt can be repeated; the step is done when both sentences were right", async () => {
    render(<PhrasesStep groups={step("step-2", "phrases").groups} progressKey={KEY} />);
    expect(screen.getByTestId("phrase-arabic-p-ana-majid")).toHaveTextContent("أَنَا مَاجِدٌ.");
    expect(screen.getByTestId("phrase-german-p-wa-ana-fatima")).toHaveTextContent("Und ich heiße Fatima.");
    expect(screen.getByTestId("phrase-arabic-p-ana-majid")).toHaveAttribute("dir", "rtl");

    fireEvent.click(screen.getByTestId("exercise-p-ana-majid-listen"));
    await waitFor(() => expect(tts.speak).toHaveBeenCalledWith("أَنَا مَاجِدٌ."));

    verdicts = [false];
    await record("p-ana-majid");
    expect(screen.queryByTestId("phrase-passed-p-ana-majid")).toBeNull();
    expect(screen.getByTestId("phrases-count")).toHaveTextContent("0 von 2");
    await record("p-ana-majid"); // again: right
    expect(screen.getByTestId("phrase-passed-p-ana-majid")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    await record("p-wa-ana-fatima");
    expect(fetchMock.mock.calls.map(([, init]) => (init!.body as FormData).get("target"))).toEqual(["أنا ماجد", "أنا ماجد", "وأنا فاطمة"]);
    await waitFor(() => expect(getLessonProgress(KEY).completedAt).toBeTruthy());
    expect(getLessonProgress(KEY).passed).toEqual(["p-ana-majid", "p-wa-ana-fatima"]);
    expect(screen.getByTestId("step-completed")).toBeInTheDocument();
  });

  it("the greeting: the masculine and feminine forms are marked as such, with the note on the last vowel", () => {
    render(<PhrasesStep groups={step("step-1", "phrases").groups} progressKey="x" />);
    expect(screen.getByTestId("phrase-p-kayfa-haluka")).toHaveAttribute("data-gender", "m");
    expect(screen.getByTestId("phrase-tag-p-kayfa-haluka")).toHaveTextContent("zu einem Mann");
    expect(screen.getByTestId("phrase-p-kayfa-haluki")).toHaveAttribute("data-gender", "f");
    expect(screen.getByTestId("phrase-tag-p-kayfa-haluki")).toHaveTextContent("zu einer Frau");
    expect(screen.getByTestId("phrase-note-befinden")).toHaveTextContent("zu einem Mann");
    expect(screen.getByTestId("phrases-count")).toHaveTextContent("0 von 5");
  });
});
