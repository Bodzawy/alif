import type { ClozePart } from "@/data/types";

/** A cloze line with the book's model answer in every gap – what "Anhören" speaks (on the TTS allow-list). */
export const clozeLineText = (parts: ClozePart[]) => parts.map((part) => (typeof part === "string" ? part : part.accept[0]!)).join("");
