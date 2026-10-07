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

function migrateOnce(raw: string | null): string | null {
  if (migrationChecked) return raw;
  migrationChecked = true;
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG)) return raw;
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (parsed && typeof parsed === "object") {
      const migrated = copyLegacyLessonProgress(parsed as ProgressState);
      if (migrated !== parsed) {
        raw = JSON.stringify(migrated);
        window.localStorage.setItem(STORAGE_KEY, raw);
      }
    }
    window.localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
  } catch {
    // Unreadable or blocked storage: leave everything as it is.
  }
  return raw;
}

function read(): ProgressState {
  let raw: string | null = null;
  try {
    raw = migrateOnce(window.localStorage.getItem(STORAGE_KEY));
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
