"use client";

import { Fragment, useCallback, useSyncExternalStore, type ReactNode } from "react";

import { MixedText } from "@/components/ui/mixed-text";
import { DEFAULT_LOCALE, readLocale, subscribeLocale, type Locale } from "@/lib/locale";

import { translate } from "./translate";

/** The learner's language (German on the server and before the page is hydrated). */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, () => readLocale() ?? DEFAULT_LOCALE, () => DEFAULT_LOCALE);
}

/** t("Anhören") → the text in the learner's language. */
export function useT() {
  const locale = useLocale();
  return useCallback((text: string, params?: Record<string, string | number>) => translate(text, locale, params), [locale]);
}

/** For server components: <T>Anhören</T>. */
export function T({ children, params }: { children: string; params?: Record<string, string | number> }) {
  const t = useT();
  return <>{t(children, params)}</>;
}

/** For server components: a text with Arabic words in it (MixedText), translated. */
export function TMixed({ text, params }: { text: string; params?: Record<string, string | number> }) {
  const t = useT();
  return <MixedText text={t(text, params)} />;
}

/** "Formen: أ · ـأ": on phones only "Formen" is shown (six pills fit on two lines); the full title stays in the text. */
export function TPillTitle({ title }: { title: string }) {
  const translated = useT()(title);
  const cut = translated.indexOf(": ");
  if (cut < 0) return <>{translated}</>;
  return (
    <span>
      {translated.slice(0, cut)}
      <span className="hidden sm:inline">{translated.slice(cut)}</span>
    </span>
  );
}

/**
 * A sentence with elements in it (e.g. an Arabic letter in its own font): the translation of `text`
 * with each {name} replaced by `nodes[name]` – the word order of the learner's language is kept.
 */
export function useRichT() {
  const t = useT();
  return useCallback(
    (text: string, nodes: Record<string, ReactNode>) =>
      t(text)
        .split(/\{(\w+)\}/)
        .map((part, i) => <Fragment key={i}>{i % 2 === 1 ? (nodes[part] ?? `{${part}}`) : part}</Fragment>),
    [t]
  );
}
