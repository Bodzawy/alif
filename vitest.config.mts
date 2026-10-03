import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const alifSrc = path.resolve(__dirname, "./src");
const legacyMasaarRoot = path.resolve(__dirname, "./tests/fixtures/legacy-masaar");

// "@/…" resolves to Alif's src/ – except inside the frozen legacy Masaar
// fixture, where it means the fixture's own src/, exactly as in the Masaar
// repository. (A plain resolve.alias would send the fixture's imports to Alif's
// code and the parity tests would compare Alif with itself.)
const projectAlias = {
  name: "project-alias",
  enforce: "pre" as const,
  async resolveId(
    this: { resolve: (source: string, importer?: string, options?: { skipSelf?: boolean }) => Promise<unknown> },
    source: string,
    importer?: string
  ) {
    if (!source.startsWith("@/")) return null;
    const root = importer?.startsWith(legacyMasaarRoot + path.sep) ? path.join(legacyMasaarRoot, "src") : alifSrc;
    return this.resolve(path.join(root, source.slice(2)), importer, { skipSelf: true });
  },
};

export default defineConfig({
  plugins: [projectAlias, react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}", "tests/parity/**/*.test.ts"],
    exclude: ["node_modules", ".next", "e2e"],
  },
  resolve: {
    alias: {
      // "server-only" throws outside a React Server Components build.
      "server-only": path.resolve(__dirname, "./vitest.server-only-stub.ts"),
    },
  },
});
