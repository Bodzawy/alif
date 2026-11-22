import type { A1UnitGroup } from "@/data/types";

// The sections of /a2: every unit of the book "لغتنا الفصحى 2" (الوحدة الأولى …) has two lessons (تقديم ١ / ٢).

const unit = (n: number, arabic: string, german: string): A1UnitGroup => ({ id: `unit-${n}`, arabic, german: `Unit ${n} · ${german}` });

export const A2_GROUPS = {
  unit1: unit(1, "الْوَحْدَةُ الْأُولَى", "Wohnen und beschreiben"),
} satisfies Record<string, A1UnitGroup>;
