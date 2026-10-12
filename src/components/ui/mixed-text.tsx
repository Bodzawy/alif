import { Fragment } from "react";

const ARABIC_RUN = /([؀-ۿ][؀-ۿً-ٰٟ\s،؟]*[؀-ۿً-ٰٟ؟]|[؀-ۿ])/g;

/** German text with Arabic words in it: the Arabic runs in the Arabic font, large enough to read. */
export function MixedText({ text, arabicClassName = "font-arabic text-[1.35em] leading-none" }: { text: string; arabicClassName?: string }) {
  return (
    <>
      {text.split(ARABIC_RUN).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} lang="ar" dir="rtl" className={arabicClassName}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
