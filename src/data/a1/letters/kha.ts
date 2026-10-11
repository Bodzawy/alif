import { khaWriting } from "@/data/letters/kha";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Cha – book pages 17 and 18 (Lesson1.pdf). Words, spellings and
// order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.

export const a1Kha = letterLesson({
  letter: { id: "kha", glyph: "خ", name: "Cha", latin: "ch" },
  words: {
    fatha: [
      ["khas", "خَس", "Salat", "Chas", "Ein Salatkopf"],
      ["khamsa", "خَمْسَة", "fünf", "Chamsa", "Fünf Äpfel und die Zahl 5"],
      ["khatam", "خَاتَم", "Ring", "Chātam", "Ein Ring"],
    ],
    kasra: [
      ["khiyar", "خِيَار", "Gurke", "Chiyār", ["/images/vocabulary/khiyar.svg", "Eine grüne Gurke"]],
      ["khitab", "خِطَاب", "Brief", "Chiṭāb", ["/images/vocabulary/zarf.svg", "Ein Briefumschlag"]],
      ["khiyam", "خِيَام", "Zelte", "Chiyām", "Zelte"],
    ],
    damma: [
      ["khudar", "خُضَار", "Gemüse", "Chuḍār", "Gemüse: Karotte, Tomate und Paprika"],
      ["khudha", "خُوذَة", "Helm", "Chūdha", "Ein Helm"],
      ["khubz", "خُبْز", "Brot", "Chubz", ["/images/vocabulary/khubz.svg", "Ein Laib Brot"]],
    ],
  },
  forms: {
    start: ["khiyar", "خِيَار", "Gurke"],
    middle: ["alkhubz", "الْخُبْز", "das Brot"],
    end: ["tabakh", "طَبَخ", "er kochte"],
    separate: ["farkh", "فَرْخ", "Küken"],
    sukun: ["nakhla", "نَخْلَة", "Palme"],
  },
  writing: khaWriting,
  formsPictures: {
    alkhubz: ["/images/vocabulary/khubz.svg", "Ein Laib Brot"],
    tabakh: "Ein Topf auf dem Herd",
    farkh: "Ein Küken",
    nakhla: "Eine Palme",
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["_س", "خَس", "khas"],
      ["_مْسَة", "خَمْسَة", "khamsa"],
      ["_طَاب", "خِطَاب", "khitab"],
      ["_بْز", "خُبْز", "khubz"],
      ["_ضَار", "خُضَار", "khudar"],
      ["_وذَة", "خُوذَة", "khudha"],
      ["_اتَم", "خَاتَم", "khatam"],
      ["_يَام", "خِيَام", "khiyam"],
      ["_يَار", "خِيَار", "khiyar"],
    ],
    // Hören – book تدريب ٣, in book order.
    listen: [
      ["_يَار", "خِيَار", "khiyar"],
      ["_اتَم", "خَاتَم", "khatam"],
      ["_طَاب", "خِطَاب", "khitab"],
      ["_مْسَة", "خَمْسَة", "khamsa"],
      ["_ضَار", "خُضَار", "khudar"],
      ["_بْز", "خُبْز", "khubz"],
      ["_س", "خَس", "khas"],
      ["_وذَة", "خُوذَة", "khudha"],
      ["_يَام", "خِيَام", "khiyam"],
      ["نَ_لَة", "نَخْلَة", "nakhla"],
    ],
  },
});
