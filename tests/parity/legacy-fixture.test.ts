// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ALPHABET } from "@/data/alphabet";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import manifest from "../fixtures/legacy-masaar/manifest.json";
import { ARABIC_LETTERS as LEGACY_LETTERS } from "../fixtures/legacy-masaar/src/lib/pronunciation/letters";

const fixture = path.resolve(__dirname, "../fixtures/legacy-masaar");
const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

describe("frozen legacy Masaar fixture", () => {
  it("is unchanged since it was copied from Masaar", () => {
    expect(manifest.commit).toBe("edea01294b6efb06126a2e3c6eecc69e68086079");
    for (const [file, hash] of Object.entries(manifest.files)) {
      expect(sha256(path.join(fixture, file)), file).toBe(hash);
    }
  });

  it("Alif's letter_conditions.json is byte-identical to Masaar's", () => {
    expect(readFileSync(path.resolve(__dirname, "../../src/lib/pronunciation/letter_conditions.json"))).toEqual(
      readFileSync(path.join(fixture, "src/lib/pronunciation/letter_conditions.json"))
    );
  });

  it("Alif's letter list equals Masaar's (order, reference texts, spoken names)", () => {
    expect(ARABIC_LETTERS).toEqual(LEGACY_LETTERS);
  });

  it("A0 practises exactly Masaar's 28 letters with Masaar's targets and TTS texts", () => {
    expect(ALPHABET).toHaveLength(28);
    expect(ALPHABET.map((letter) => letter.exercise.target)).toEqual(LEGACY_LETTERS.map((letter) => letter.referenceText));
    expect(ALPHABET.map((letter) => letter.exercise.modelText)).toEqual(LEGACY_LETTERS.map((letter) => letter.modelText));
    expect(ALPHABET.map((letter) => letter.id)).toEqual(LEGACY_LETTERS.map((letter) => letter.id));
  });
});
