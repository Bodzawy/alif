import { currentTrack, subscribeTrack } from "./track";

// Per-browser lesson progress. Kept deliberately small and behind this module
// so it can be replaced by a server-side store once Alif gets accounts.
// Each programme (src/lib/track.ts) has its own progress: "pronunciation" keeps
// the key from before the programmes, "speaking" starts empty.

const STORAGE_KEY = "alif:progress:v1";
const SPEAKING_STORAGE_KEY = "alif:progress:speaking:v1";
const listeners = new Set<() => void>();

function storageKey() {
  return currentTrack() === "speaking" ? SPEAKING_STORAGE_KEY : STORAGE_KEY;
}

export type LessonProgress = {
  passed: string[];
  completedAt?: string;
  /** Exercises the student skipped without passing them (A0 escape hatch). */
  skipped?: string[];
  /** Set once the student finished or skipped the lesson's intro video. */
  introSeenAt?: string;
};
type ProgressState = Record<string, LessonProgress>;

export function lessonKey(levelSlug: string, lessonSlug: string) {
  return `${levelSlug}/${lessonSlug}`;
}

let cachedKey: string | undefined;
let cachedRaw: string | null | undefined;
let cachedState: ProgressState = {};

// The vocabulary lessons moved from A1 (/a1/lesson-N, key "a1/lesson-N") to
// A0 → Wörter (/a0/words/lesson-N, key "a0/words/lesson-N"). Their progress is
// copied to the new keys once per browser. Nothing is deleted: the old entries
// stay as they were, and an entry already present under the new key wins.
const MIGRATION_FLAG = "alif:progress:migrated:a1-lessons-to-a0-words";
const LEGACY_LESSON_KEY = /^a1\/(lesson-\d+)$/;
let migrationChecked = false;

export function copyLegacyLessonProgress(state: ProgressState): ProgressState {
  let next = state;
  for (const [key, value] of Object.entries(state)) {
    const lesson = LEGACY_LESSON_KEY.exec(key)?.[1];
    const target = lesson && `a0/words/${lesson}`;
    if (target && !state[target]) next = { ...next, [target]: value };
  }
  return next;
}

// A1 · Lektion 1 became a lesson with entries (/a1/lesson-1/<entry>/step-N),
// and Alif's step 1 "Laute" became part of "Wörter": Alif's old steps
// a1/lesson-1/step-N (N ≥ 2) are a1/lesson-1/alif/step-(N − 1) now. Copied the
// same way (once, nothing deleted, an existing new entry wins). The old
// "Laute" step has no new place.
const A1_MIGRATION_FLAG = "alif:progress:migrated:a1-lesson-1-entries";
const OLD_ALIF_STEP_KEY = /^a1\/lesson-1\/step-(\d+)$/;

export function copyMovedA1Progress(state: ProgressState): ProgressState {
  let next = state;
  for (const [key, value] of Object.entries(state)) {
    const n = Number(OLD_ALIF_STEP_KEY.exec(key)?.[1] ?? 0);
    const target = n >= 2 && `a1/lesson-1/alif/step-${n - 1}`;
    if (target && !state[target]) next = { ...next, [target]: value };
  }
  return next;
}

// The entry "صَبَاحُ الْخَيْر" got the two conversations (steps 1–6); its steps mean
// something else now (published: step-1 "Sprechen", step-2 "Buchstaben finden").
// The letters' progress moves to step-7 and the two old entries are removed, so
// the new conversation steps are not shown as done.
const SABAH_MIGRATION_FLAG = "alif:progress:migrated:a1-sabah-al-khayr-dialogue";
const SABAH = "a1/lesson-1/sabah-al-khayr";
export const SABAH_LETTERS_STEP = "step-7";

export function moveSabahAlKhayrProgress(state: ProgressState): ProgressState {
  const old1 = state[`${SABAH}/step-1`];
  const old2 = state[`${SABAH}/step-2`];
  if (!old1 && !old2) return state;
  const next = { ...state };
  delete next[`${SABAH}/step-1`];
  delete next[`${SABAH}/step-2`];
  if (old2 && !state[`${SABAH}/${SABAH_LETTERS_STEP}`]) next[`${SABAH}/${SABAH_LETTERS_STEP}`] = old2;
  return next;
}

const MIGRATIONS: Array<[flag: string, migrate: (state: ProgressState) => ProgressState]> = [
  [MIGRATION_FLAG, copyLegacyLessonProgress],
  [A1_MIGRATION_FLAG, copyMovedA1Progress],
  [SABAH_MIGRATION_FLAG, moveSabahAlKhayrProgress],
];

function migrateOnce(raw: string | null): string | null {
  if (migrationChecked) return raw;
  migrationChecked = true;
  for (const [flag, migrate] of MIGRATIONS) {
    try {
      if (window.localStorage.getItem(flag)) continue;
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (parsed && typeof parsed === "object") {
        const migrated = migrate(parsed as ProgressState);
        if (migrated !== parsed) {
          raw = JSON.stringify(migrated);
          window.localStorage.setItem(STORAGE_KEY, raw);
        }
      }
      window.localStorage.setItem(flag, new Date().toISOString());
    } catch {
      // Unreadable or blocked storage: leave everything as it is.
    }
  }
  return raw;
}

function read(): ProgressState {
  const key = storageKey();
  let raw: string | null = null;
  try {
    // The migrations concern progress from before the programmes.
    const stored = window.localStorage.getItem(key);
    raw = key === STORAGE_KEY ? migrateOnce(stored) : stored;
  } catch {
    raw = null;
  }
  if (key === cachedKey && raw === cachedRaw) return cachedState;
  cachedKey = key;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    cachedState = parsed && typeof parsed === "object" ? (parsed as ProgressState) : {};
  } catch {
    cachedState = {};
  }
  return cachedState;
}

function write(state: ProgressState) {
  const key = storageKey();
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode, blocked): progress lives only in memory.
    cachedKey = key;
    cachedRaw = undefined;
    cachedState = state;
  }
  listeners.forEach((listener) => listener());
}

export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === SPEAKING_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  // Another programme chosen: its progress applies from now on.
  const unsubscribeTrack = subscribeTrack(listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    unsubscribeTrack();
  };
}

const EMPTY: LessonProgress = { passed: [] };

export function getLessonProgress(key: string): LessonProgress {
  return read()[key] ?? EMPTY;
}

export function markExercisePassed(key: string, exerciseId: string) {
  const state = read();
  const lesson = state[key] ?? EMPTY;
  if (lesson.passed.includes(exerciseId)) return;
  write({ ...state, [key]: { ...lesson, passed: [...lesson.passed, exerciseId] } });
}

/** Records a skip. A skip never counts as passed; passing later supersedes it. */
export function markExerciseSkipped(key: string, exerciseId: string) {
  const state = read();
  const lesson = state[key] ?? EMPTY;
  const skipped = lesson.skipped ?? [];
  if (skipped.includes(exerciseId) || lesson.passed.includes(exerciseId)) return;
  write({ ...state, [key]: { ...lesson, skipped: [...skipped, exerciseId] } });
}

export function markLessonCompleted(key: string) {
  const state = read();
  const lesson = state[key] ?? EMPTY;
  if (lesson.completedAt) return;
  write({ ...state, [key]: { ...lesson, completedAt: new Date().toISOString() } });
}

export function markIntroSeen(key: string) {
  const state = read();
  const lesson = state[key] ?? EMPTY;
  if (lesson.introSeenAt) return;
  write({ ...state, [key]: { ...lesson, introSeenAt: new Date().toISOString() } });
}

export function resetLessonProgress(key: string) {
  const state = { ...read() };
  delete state[key];
  write(state);
}
