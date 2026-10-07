/** "الدرس الأول", "الدرس الثاني", … – Arabic lesson labels for the A1 lesson cards. */
const ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];

export function arabicLessonLabel(number: number): string {
  const ordinal = ORDINALS[number - 1];
  return ordinal ? `الدرس ${ordinal}` : `الدرس ${number}`;
}
