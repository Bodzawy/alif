import { expect, test, type Page } from "@playwright/test";

import { collectPageErrors } from "./support/helpers";

// The homepage: header (navigation, language, "Anmelden"), hero (start, intro
// video), "Dein Lernweg" (A0 – C2), features, about and questions – on a wide
// desktop, a laptop and a phone.

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"];

test.describe("desktop 1536", () => {
  test.use({ viewport: { width: 1536, height: 1024 } });

  test("hero, header and the seven levels in one row; only A0 and A1 are links", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Arabisch lernen\s*mit Alif\./);
    await expect(page.getByText("Dein Weg zur arabischen Sprache")).toBeVisible();
    await expect(page.getByTestId("home-header").getByRole("link", { name: "Startseite", exact: true })).toHaveAttribute("aria-current", "page");
    // The site header of the other pages is not shown twice.
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.getByTestId("hero-art")).toBeVisible();

    const cards = LEVELS.map((code) => page.getByTestId(`level-card-${code}`));
    const boxes = await Promise.all(cards.map((c) => c.boundingBox()));
    expect(new Set(boxes.map((b) => Math.round(b!.y))).size).toBe(1); // one row
    await expect(cards[0]!).toHaveAttribute("href", "/a0");
    await expect(cards[0]!).toContainText("28 Lektionen");
    await expect(cards[1]!).toHaveAttribute("href", "/a1");
    for (const code of LEVELS.slice(2)) {
      await expect(page.getByTestId(`level-card-${code}`)).not.toHaveAttribute("href", /.*/);
      await expect(page.getByTestId(`level-soon-${code}`)).toBeVisible();
    }
    await expect(page.getByTestId("feature-strip").locator("li")).toHaveText([/Hören/, /Nachsprechen/, /Schritt für Schritt/, /Für jedes Alter/]);
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("navigation: Lernweg, Über Alif, Häufige Fragen lead to their sections; level cards to A0 / A1", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByTestId("home-header").getByRole("navigation");
    for (const [label, id] of [["Lernweg", "lernweg"], ["Über Alif", "ueber-alif"], ["Häufige Fragen", "fragen"]] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
    await page.getByTestId("faq").getByText("Brauche ich ein Konto?").click();
    await expect(page.getByTestId("faq")).toContainText("Alif speichert deinen Fortschritt in deinem Browser.");
    await page.getByTestId("level-card-a1").click();
    await expect(page).toHaveURL(/\/a1$/);
    await expect(page.getByRole("banner")).toContainText("A0"); // the site header on every other page
  });

  test("language menu and Anmelden say what exists; Jetzt starten opens the alphabet", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("language-menu").locator("summary").click();
    await expect(page.getByTestId("language-menu")).toContainText("Weitere Sprachen der Oberfläche sind noch nicht verfügbar.");
    await page.getByTestId("login-menu").locator("summary").click();
    await expect(page.getByTestId("login-info")).toContainText("Du brauchst kein Konto.");
    await page.getByTestId("cta-start").click();
    await expect(page).toHaveURL(/\/a0\/letters$/);
  });

  test("Video ansehen: the intro video in a dialog; closing stops it", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByTestId("video-dialog");
    await expect(dialog).not.toBeVisible();
    await page.getByTestId("hero-video").click();
    await expect(dialog).toBeVisible();
    const video = page.getByTestId("video-player");
    await expect(video).toHaveAttribute("src", "/videos/a1/lesson-1/de.mp4");
    await expect(video).toHaveAttribute("poster", "/videos/a1/lesson-1/poster.jpg");
    expect((await page.request.get("/videos/a1/lesson-1/poster.jpg")).status()).toBe(200);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await page.getByTestId("hero-video").click();
    await page.getByTestId("video-close").click();
    await expect(dialog).not.toBeVisible();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });
});

test.describe("laptop 1280", () => {
  test.use({ viewport: { width: 1280, height: 860 } });

  test("the levels wrap (four per row) instead of becoming too narrow; nothing overflows", async ({ page }) => {
    await page.goto("/");
    const a0 = (await page.getByTestId("level-card-a0").boundingBox())!;
    const b2 = (await page.getByTestId("level-card-b2").boundingBox())!;
    expect(b2.y).toBeGreaterThan(a0.y + a0.height - 1);
    expect(a0.width).toBeGreaterThan(220);
    const overflowing = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="level-card-"] *')].filter((e) => !e.classList.contains("sr-only") && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).length);
    expect(overflowing).toBe(0);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("menu instead of the navigation; hero, levels and sections without horizontal scrolling; large touch targets", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/");
    await expect(page.getByTestId("home-header").getByRole("navigation", { name: "Hauptnavigation", exact: true })).toBeHidden();
    await page.getByTestId("mobile-menu").locator("summary").tap();
    await page.getByTestId("mobile-menu").getByRole("link", { name: "Lernweg" }).tap();
    await expect(page).toHaveURL(/#lernweg$/);
    for (const id of ["cta-start", "hero-video"]) {
      const box = (await page.getByTestId(id).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
    for (const code of LEVELS) {
      const box = (await page.getByTestId(`level-card-${code}`).boundingBox())!;
      expect(box.x + box.width, code).toBeLessThanOrEqual(390);
    }
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });
});
