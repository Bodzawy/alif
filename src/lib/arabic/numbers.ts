// Arabic number words as the book "لغتنا الفصحى 1" prints them (Unit 6):
// 0–20, the tens up to 100 and the compounds (وَاحِد وَعِشْرُون …), and the
// ordinals; plus a reading of digit strings for the speech synthesis (a phone
// number is read digit by digit, a short number as a word).

export const UNITS = ["صِفْر", "وَاحِد", "اثْنَان", "ثَلَاثَة", "أَرْبَعَة", "خَمْسَة", "سِتَّة", "سَبْعَة", "ثَمَانِيَة", "تِسْعَة"];
export const TEENS = ["عَشَرَة", "أَحَدَ عَشَرَ", "اثْنَا عَشَرَ", "ثَلَاثَةَ عَشَرَ", "أَرْبَعَةَ عَشَرَ", "خَمْسَةَ عَشَرَ", "سِتَّةَ عَشَرَ", "سَبْعَةَ عَشَرَ", "ثَمَانِيَةَ عَشَرَ", "تِسْعَةَ عَشَرَ"];
export const TENS = ["", "عَشَرَة", "عِشْرُون", "ثَلَاثُون", "أَرْبَعُون", "خَمْسُون", "سِتُّون", "سَبْعُون", "ثَمَانُون", "تِسْعُون"];
export const ORDINALS = ["", "الْأَوَّل", "الثَّانِي", "الثَّالِث", "الرَّابِع", "الْخَامِس", "السَّادِس", "السَّابِع", "الثَّامِن", "التَّاسِع", "الْعَاشِر", "الْحَادِيَ عَشَرَ", "الثَّانِيَ عَشَرَ"];

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const toArabicDigits = (n: number | string) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]!);
export const fromArabicDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

/** The cardinal word for 0–100 (e.g. 45 → "خَمْسَة وَأَرْبَعُون"). */
export function numberWord(n: number): string {
  if (n < 0 || n > 100 || !Number.isInteger(n)) throw new Error(`numberWord: ${n}`);
  if (n === 100) return "مِائَة";
  if (n < 10) return UNITS[n]!;
  if (n < 20) return TEENS[n - 10]!;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? TENS[t]! : `${UNITS[u]} وَ${TENS[t]}`;
}

/** Digits as words for the speech synthesis: a run of 5+ digits digit by digit, a shorter one as a number word. */
export function spokenDigits(text: string): string {
  return text.replace(/[0-9٠-٩]+/g, (run) => {
    const digits = fromArabicDigits(run);
    if (digits.length >= 5) return Array.from(digits).map((d) => UNITS[Number(d)]).join(" ");
    const n = Number(digits);
    return n <= 100 ? numberWord(n) : Array.from(digits).map((d) => UNITS[Number(d)]).join(" ");
  });
}

const HUNDREDS = ["", "مِائَة", "مِائَتَان", "ثَلَاثُمِائَة", "أَرْبَعُمِائَة", "خَمْسُمِائَة", "سِتُّمِائَة", "سَبْعُمِائَة", "ثَمَانِمِائَة", "تِسْعُمِائَة"];

/** The cardinal word for 0–999 999 (a price, e.g. 1500 → "أَلْف وَخَمْسُمِائَة"). */
export function bigNumberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new Error(`bigNumberWord: ${n}`);
  if (n <= 100) return numberWord(n);
  const parts: string[] = [];
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  if (thousands === 1) parts.push("أَلْف");
  else if (thousands === 2) parts.push("أَلْفَان");
  else if (thousands >= 3 && thousands <= 10) parts.push(`${numberWord(thousands)} آلَاف`);
  else if (thousands > 10) parts.push(`${bigNumberWord(thousands)} أَلْفًا`);
  const h = Math.floor(rest / 100);
  const r = rest % 100;
  if (h) parts.push(HUNDREDS[h]!);
  if (r) parts.push(numberWord(r));
  return parts.join(" وَ");
}

/** A price as the book writes it ("١٥,٠٣٠" = 15 030; "١٥,٦٠" = 15 pounds 60 piasters): its spoken words. */
export function priceWords(price: string, unit = "جُنَيْه"): string {
  const western = fromArabicDigits(price).replace(/\s/g, "");
  const [whole, frac] = western.split(/[.,]/);
  // A group of three digits after the comma is thousands (١٥,٠٣٠), two digits are piasters (١٥,٦٠).
  if (frac && frac.length === 3) return `${bigNumberWord(Number(whole + frac))} ${unit}`;
  const pounds = `${bigNumberWord(Number(whole))} ${unit}`;
  return frac && Number(frac) ? `${pounds} وَ${bigNumberWord(Number(frac))} قِرْشًا` : pounds;
}
