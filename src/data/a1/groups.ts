import type { A1UnitGroup } from "@/data/types";

// The sections of /a1: Lektion 1–2 open the book, then every unit of the book
// (الوحدة الثانية … العاشرة) has two lessons (تقديم ١ / ٢).

const unit = (n: number, arabic: string, german: string): A1UnitGroup => ({ id: `unit-${n}`, arabic, german: `Unit ${n} · ${german}` });

export const A1_GROUPS = {
  start: { id: "start", arabic: "الْبِدَايَةُ", german: "Einstieg" },
  unit2: unit(2, "الْوَحْدَةُ الثَّانِيَةُ", "Nach Personen fragen"),
  unit3: unit(3, "الْوَحْدَةُ الثَّالِثَةُ", "Wer ist er? Woher kommst du?"),
  unit4: unit(4, "الْوَحْدَةُ الرَّابِعَةُ", "Nationalitäten und Dinge"),
  unit5: unit(5, "الْوَحْدَةُ الْخَامِسَةُ", "Wem gehört das?"),
  unit6: unit(6, "الْوَحْدَةُ السَّادِسَةُ", "Zahlen, Daten, Telefon"),
  unit7: unit(7, "الْوَحْدَةُ السَّابِعَةُ", "Preise und Farben"),
  unit8: unit(8, "الْوَحْدَةُ الثَّامِنَةُ", "Orte und Wege"),
  unit9: unit(9, "الْوَحْدَةُ التَّاسِعَةُ", "Der Alltag"),
  unit10: unit(10, "الْوَحْدَةُ الْعَاشِرَةُ", "Familie, Beruf und Wetter"),
} satisfies Record<string, A1UnitGroup>;
