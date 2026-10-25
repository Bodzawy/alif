"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { chooseTrack, readTrack, subscribeTrack, TRACKS, type Track } from "@/lib/track";
import { cn } from "@/lib/utils";

// The programme: TrackSwitch (in the headers, possibly more than once) shows the
// chosen one and opens TrackDialog, a native modal <dialog> mounted once in the
// layout (focus trap and backdrop from the browser). Before the first choice
// the dialog opens by itself on whatever page the visitor lands and cannot be
// dismissed – Alif needs to know how to judge the answers.

const ORDER: Track[] = ["speaking", "pronunciation"];
const noop = () => () => undefined;
const openers = new Set<() => void>();

function useTrack() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const track = useSyncExternalStore(subscribeTrack, readTrack, () => null);
  return { hydrated, track };
}

export function TrackSwitch({ className }: { className?: string }) {
  const { hydrated, track } = useTrack();
  return (
    <button
      type="button"
      onClick={() => openers.forEach((open) => open())}
      data-testid="track-switch"
      data-track={track ?? ""}
      aria-label={track ? `Programm: ${TRACKS[track].name} – ${TRACKS[track].level}. Ändern` : "Programm wählen"}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 focus-ring",
        !hydrated && "invisible",
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", track === "speaking" ? "bg-accent" : "bg-primary")} aria-hidden />
      {track ? TRACKS[track].level : "Programm"}
      <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function TrackDialog() {
  const { hydrated, track } = useTrack();
  const dialog = useRef<HTMLDialogElement>(null);
  const firstChoice = hydrated && track === null;

  useEffect(() => {
    const open = () => {
      const el = dialog.current;
      if (!el || el.open) return;
      el.showModal();
      el.focus(); // not the first option: it would look chosen
    };
    openers.add(open);
    return () => void openers.delete(open);
  }, []);

  useEffect(() => {
    if (firstChoice) openers.forEach((open) => open());
  }, [firstChoice]);

  function choose(value: Track) {
    chooseTrack(value);
    dialog.current?.close();
  }

  return (
    <dialog
      ref={dialog}
      // Before the first choice Esc does not close it.
      onCancel={(event) => readTrack() === null && event.preventDefault()}
      onClick={(event) => event.target === dialog.current && readTrack() !== null && dialog.current?.close()}
      aria-labelledby="track-title"
      tabIndex={-1}
      data-testid="track-dialog"
      className="w-[min(40rem,calc(100vw-2rem))] rounded-3xl bg-background p-0 text-foreground shadow-2xl outline-none backdrop:bg-brand-navy/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="track-title" className="text-xl font-bold tracking-tight sm:text-2xl">
              {track ? "Programm wechseln" : "Willkommen bei Alif! Wähle dein Programm"}
            </h2>
            <p lang="ar" dir="rtl" className="mt-1 font-arabic text-lg text-muted-foreground">
              اختر مستواك
            </p>
          </div>
          {track && (
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Schließen"
              data-testid="track-close"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-ring"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>

        <ol className="mt-5 grid gap-3">
          {ORDER.map((value, index) => {
            const info = TRACKS[value];
            const selected = value === track;
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => choose(value)}
                  aria-pressed={selected}
                  data-testid={`track-option-${value}`}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border-2 bg-card p-4 text-left transition hover:border-primary/60 focus-ring sm:p-5",
                    selected ? "border-primary" : "border-border"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {selected ? <Check className="h-5 w-5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold">
                      {info.name} – {info.level}
                    </span>
                    <span lang="ar" dir="rtl" className="mt-1 block text-start font-arabic text-lg leading-relaxed text-primary">
                      {info.arabic}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{info.german}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-sm text-muted-foreground">
          Du kannst das Programm jederzeit oben auf der Seite wechseln. Jedes Programm hat seinen eigenen Fortschritt.
        </p>
      </div>
    </dialog>
  );
}
