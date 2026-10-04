// Per-browser lesson progress. Kept deliberately small and behind this module
// so it can be replaced by a server-side store once Alif gets accounts.

const STORAGE_KEY = "alif:progress:v1";
const listeners = new Set<() => void>();

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

let cachedRaw: string | null | undefined;
let cachedState: ProgressState = {};

function read(): ProgressState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedState;
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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode, blocked): progress lives only in memory.
    cachedRaw = undefined;
    cachedState = state;
  }
  listeners.forEach((listener) => listener());
}

export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
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
