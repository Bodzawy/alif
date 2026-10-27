import "@testing-library/jest-dom/vitest";

// Components may navigate with useRouter (e.g. Schreiben opens the next step by itself);
// the tests render them without Next's app router, so it is a stub here.
import { vi } from "vitest";

export const routerPush = vi.fn();
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({ push: routerPush, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn(), prefetch: vi.fn() }),
}));
