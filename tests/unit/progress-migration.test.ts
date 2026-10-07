import { beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "alif:progress:v1";

async function freshProgressModule() {
  vi.resetModules();
  return import("@/lib/progress");
}

beforeEach(() => window.localStorage.clear());

describe("progress of the word lessons that moved from A1 to A0 → Wörter", () => {
  it("copies a1/lesson-N to a0/words/lesson-N once, keeps the old entries and the alphabet untouched", async () => {
    const before = {
      "a0/alphabet": { passed: ["alif", "baa"], skipped: ["taa"] },
      "a1/lesson-1": { passed: ["letter", "asad"], completedAt: "2026-10-01T10:00:00.000Z", introSeenAt: "2026-10-01T09:00:00.000Z" },
      "a1/lesson-2": { passed: ["letter"] },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(before));

    const { getLessonProgress, lessonKey } = await freshProgressModule();
    expect(getLessonProgress(lessonKey("a0/words", "lesson-1"))).toEqual(before["a1/lesson-1"]);
    expect(getLessonProgress(lessonKey("a0/words", "lesson-2"))).toEqual(before["a1/lesson-2"]);
    expect(getLessonProgress("a0/alphabet")).toEqual(before["a0/alphabet"]);

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored["a1/lesson-1"]).toEqual(before["a1/lesson-1"]);
    expect(stored["a1/lesson-2"]).toEqual(before["a1/lesson-2"]);
    expect(Object.keys(stored).sort()).toEqual(["a0/alphabet", "a0/words/lesson-1", "a0/words/lesson-2", "a1/lesson-1", "a1/lesson-2"]);
  });

  it("never overwrites progress that already exists under the new key", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "a1/lesson-1": { passed: ["letter"] }, "a0/words/lesson-1": { passed: ["letter", "asad", "arnab"] } })
    );
    const { getLessonProgress } = await freshProgressModule();
    expect(getLessonProgress("a0/words/lesson-1").passed).toEqual(["letter", "asad", "arnab"]);
  });

  it("runs only once per browser, so later A1 progress is not copied", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    (await freshProgressModule()).getLessonProgress("x");

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ "a1/lesson-1": { passed: ["new-a1-exercise"] } }));
    const { getLessonProgress } = await freshProgressModule();
    expect(getLessonProgress("a0/words/lesson-1")).toEqual({ passed: [] });
    expect(getLessonProgress("a1/lesson-1").passed).toEqual(["new-a1-exercise"]);
  });

  it("works with empty storage", async () => {
    const { getLessonProgress } = await freshProgressModule();
    expect(getLessonProgress("a0/words/lesson-1")).toEqual({ passed: [] });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
