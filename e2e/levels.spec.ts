import { expect, test } from "@playwright/test";

// Level structure: A0 = Buchstaben (/a0/letters) + Wörter (/a0/words, the
// former A1 lessons); A1 is the new curriculum (see a1.spec.ts).

test("/a0 offers Buchstaben and Wörter; each part leads back to /a0", async ({ page }) => {
  await page.goto("/a0");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buchstaben und erste Wörter");
  const letters = page.getByTestId("a0-part-letters");
  const words = page.getByTestId("a0-part-words");
  await expect(letters).toContainText("حروف");
  await expect(letters).toContainText("تعلّم الحروف العربية وتدرّب على النطق.");
  await expect(letters).toContainText("28 Buchstaben");
  await expect(words).toContainText("كلمات");
  await expect(words).toContainText("تعلّم الكلمات الأولى واستخدم الحروف التي تعلمتها.");
  await expect(words).toContainText("28 Lektionen");

  await letters.click();
  await expect(page).toHaveURL(/\/a0\/letters$/);
  await expect(page.getByRole("heading", { name: "Das arabische Alphabet" })).toBeVisible();
  await page.getByTestId("back-to-a0").click();
  await expect(page).toHaveURL(/\/a0$/);

  await words.click();
  await expect(page).toHaveURL(/\/a0\/words$/);
  await expect(page.locator('[data-testid^="lesson-link-lesson-"]')).toHaveCount(28);
  await page.getByTestId("back-to-a0").click();
  await expect(page).toHaveURL(/\/a0$/);
});

test("a lesson's breadcrumb leads back to A0 → Wörter", async ({ page }) => {
  await page.goto("/a0/words/lesson-1");
  await page.getByRole("link", { name: "A0 · Wörter" }).first().click();
  await expect(page).toHaveURL(/\/a0\/words$/);
});

test("old URLs of the former A1 word lessons lead to A0 → Wörter unless A1 has a lesson there", async ({ page, request }) => {
  for (const [from, to] of [
    ["/a1/lesson-2", "/a0/words/lesson-2"],
    ["/a1/lesson-28", "/a0/words/lesson-28"],
    ["/a1/lesson-1/intro", "/a0/words/lesson-1/intro"],
    ["/a1/lesson-5/intro", "/a0/words/lesson-5/intro"],
    // lesson-1 is the new A1 lesson: it starts at its first step.
    ["/a1/lesson-1", "/a1/lesson-1/step-1"],
  ]) {
    const response = await request.get(from!, { maxRedirects: 0 });
    expect(response.status(), from).toBe(307);
    // headersArray(): Playwright's merged headers() can repeat the value of a page-level redirect.
    const location = response.headersArray().find((header) => header.name.toLowerCase() === "location")!.value;
    expect(new URL(location, "http://x").pathname, from).toBe(to);
  }
  expect((await request.get("/a1/lesson-99")).status()).toBe(404);
  await page.goto("/a1/lesson-2");
  await expect(page).toHaveURL(/\/a0\/words\/lesson-2$/);
});

test("progress saved under the old A1 keys shows up in A0 → Wörter and is not deleted", async ({ page }) => {
  const old: Record<string, { passed: string[]; completedAt?: string }> = {
    "a0/alphabet": { passed: ["alif", "baa"] },
    ...Object.fromEntries([1, 2, 3].map((n) => [`a1/lesson-${n}`, { passed: [], completedAt: "2026-10-04T00:00:00.000Z" }])),
  };
  await page.goto("/a0");
  await page.evaluate((value) => {
    window.localStorage.clear();
    window.localStorage.setItem("alif:progress:v1", value);
  }, JSON.stringify(old));

  await page.goto("/a0/words");
  for (const n of [1, 2, 3]) await expect(page.getByTestId(`lesson-link-lesson-${n}`)).toContainText("Abgeschlossen");
  await expect(page.getByTestId("lesson-link-lesson-4")).not.toHaveAttribute("data-locked", "true");
  await expect(page.getByTestId("lesson-link-lesson-5")).toHaveAttribute("data-locked", "true");

  const stored = JSON.parse((await page.evaluate(() => window.localStorage.getItem("alif:progress:v1")))!);
  for (const [key, value] of Object.entries(old)) expect(stored[key], key).toEqual(value);
  expect(stored["a0/words/lesson-1"]).toEqual(old["a1/lesson-1"]);

  await page.goto("/a0/letters");
  await expect(page.getByTestId("alphabet-progress")).toContainText("2 / 28");
});

test("no broken internal links on the level pages", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ["/", "/a0", "/a0/letters", "/a0/letters/alif", "/a0/words", "/a0/words/lesson-1", "/a0/words/lesson-1/intro", "/a1", "/a1/lesson-1/step-1", "/a1/lesson-1/step-2", "/a1/lesson-1/step-3", "/a1/lesson-1/step-4", "/a1/lesson-1/step-5", "/a1/lesson-1/step-6"]) {
    await page.goto(path);
    const hrefs = await page.locator("a[href^='/']").evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
    hrefs.forEach((href) => seen.add(href.split("#")[0]!));
  }
  for (const href of ["/", "/a0", "/a0/letters", "/a0/letters/alif", "/a0/words", "/a0/words/lesson-1", "/a1", "/a1/lesson-1/step-1", "/a1/lesson-1/step-2", "/a1/lesson-1/step-3", "/a1/lesson-1/step-4", "/a1/lesson-1/step-5", "/a1/lesson-1/step-6"]) expect(seen, href).toContain(href);
  for (const href of seen) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});
