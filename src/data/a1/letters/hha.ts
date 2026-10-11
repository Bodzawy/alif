import { hhaWriting } from "@/data/letters/hha";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Ha (ح) – book pages 14 and 15 (Lesson1.pdf). Words, spellings
// and order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.

export const a1Hha = letterLesson({
  letter: { id: "hha", glyph: "ح", name: "Ha", latin: "ḥ" },
  words: {
    fatha: [
      ["haqiba", "حَقِيبَة", "Tasche", "Ḥaqība", "Eine Tasche"],
      ["hadiqa", "حَدِيقَة", "Garten", "Ḥadīqa", "Ein Garten mit Blumen"],
      ["hafla", "حَفْلَة", "Feier", "Ḥafla", "Eine Feier mit Luftballons und Kuchen"],
    ],
    kasra: [
      ["hisan", "حِصَان", "Pferd", "Ḥiṣān", ["/images/vocabulary/hisan.svg", "Ein braunes Pferd"]],
      ["hidha", "حِذَاء", "Schuh", "Ḥidhāʾ", "Ein Schuh"],
      ["hijara", "حِجَارَة", "Steine", "Ḥidschāra", "Steine"],
    ],
    damma: [
      ["hut", "حُوت", "Wal", "Ḥūt", ["/images/vocabulary/hut.svg", "Ein blauer Wal im Meer"]],
      ["hujra", "حُجْرَة", "Zimmer", "Ḥudschra", "Ein Zimmer mit Bett und Fenster"],
      ["hubub", "حُبُوب", "Körner", "Ḥubūb", "Körner"],
    ],
  },
  forms: {
    start: ["himar", "حِمَار", "Esel"],
    middle: ["alhafla", "الْحَفْلَة", "die Feier"],
    end: ["nasaha", "نَصَحَ", "er riet"],
    separate: ["farih", "فَرِح", "froh"],
    sukun: ["ahmar", "أَحْمَر", "rot"],
  },
  writing: hhaWriting,
  formsPictures: {
    himar: "Ein Esel",
    alhafla: ["/images/a1/hha/hafla.svg", "Eine Feier mit Luftballons und Kuchen"],
    farih: "Ein frohes Gesicht",
    ahmar: "Ein roter Farbklecks",
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["_صَان", "حِصَان", "hisan"],
      ["_قِيبَة", "حَقِيبَة", "haqiba"],
      ["_بُوب", "حُبُوب", "hubub"],
      ["_ذَاء", "حِذَاء", "hidha"],
      ["_دِيقَة", "حَدِيقَة", "hadiqa"],
      ["_وت", "حُوت", "hut"],
      ["_جَارَة", "حِجَارَة", "hijara"],
      ["_جْرَة", "حُجْرَة", "hujra"],
      ["_فْلَة", "حَفْلَة", "hafla"],
    ],
    // Hören – book تدريب ٣, in book order.
    listen: [
      ["_دِيقَة", "حَدِيقَة", "hadiqa"],
      ["_جَارَة", "حِجَارَة", "hijara"],
      ["_قِيبَة", "حَقِيبَة", "haqiba"],
      ["_وت", "حُوت", "hut"],
      ["_ذَاء", "حِذَاء", "hidha"],
      ["_صَان", "حِصَان", "hisan"],
      ["_فْلَة", "حَفْلَة", "hafla"],
      ["_بُوب", "حُبُوب", "hubub"],
      ["_جْرَة", "حُجْرَة", "hujra"],
      ["أَ_مَر", "أَحْمَر", "ahmar"],
    ],
  },
});
