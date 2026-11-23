const HARAKAT = /[\u064B-\u065F\u0670]/g;
/** The bare word: without vowels, punctuation, the article and a "و" in front of it – to find a word of a text in a list. */
export const stem = (word: string) =>
  word
    .replace(HARAKAT, "")
    .replace(/[.,،؟!:؛]/g, "")
    .replace(/^وال/, "ال")
    .replace(/^ال/, "");
