"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

// One interaction for all "Formen" activities, three ways to use it:
//   drag  – pointer events (mouse, touch, pen); the item follows the finger and
//           is dropped on the element under it that carries data-drop-target;
//   tap   – tap an item to pick it up, then tap a target;
//   keys  – items and targets are buttons: Enter/Space pick up and place.
// Draggable items get touch-action: none, so dragging never scrolls the page.

const DRAG_THRESHOLD = 6;

type Drag = { key: string; dx: number; dy: number };

export function usePickAndDrop<T>({ onDrop }: { onDrop: (item: T, target: string) => void }) {
  const [selected, setSelected] = useState<{ key: string; item: T } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const start = useRef<{ key: string; item: T; x: number; y: number; pointerId: number } | null>(null);
  const suppressClick = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const clear = useCallback(() => setSelected(null), []);

  /** Props for a draggable / pickable item (a <button>). */
  const itemProps = useCallback(
    (key: string, item: T, disabled = false) => ({
      "data-picked": selected?.key === key ? "true" : undefined,
      "aria-pressed": selected?.key === key,
      disabled,
      style: {
        touchAction: "none",
        ...(drag?.key === key
          ? ({ transform: `translate(${drag.dx}px, ${drag.dy}px)`, zIndex: 50, position: "relative", transition: "none" } satisfies CSSProperties)
          : {}),
      } as CSSProperties,
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
        // A touch drag is not followed by a click: never carry the suppression over.
        suppressClick.current = false;
        start.current = { key, item, x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      },
      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        const from = start.current;
        if (!from || from.pointerId !== event.pointerId) return;
        const dx = event.clientX - from.x;
        const dy = event.clientY - from.y;
        if (drag?.key === key || Math.hypot(dx, dy) > DRAG_THRESHOLD) setDrag({ key, dx, dy });
      },
      onPointerUp(event: ReactPointerEvent<HTMLElement>) {
        const from = start.current;
        start.current = null;
        if (!from || from.pointerId !== event.pointerId) return;
        if (drag?.key !== key) return; // a tap: handled by onClick
        suppressClick.current = true;
        setDrag(null);
        // The dragged item is under the finger itself: look through it.
        const dragged = event.currentTarget;
        const target = (document.elementsFromPoint?.(event.clientX, event.clientY) ?? [])
          .filter((element) => !dragged.contains(element))
          .map((element) => element.closest<HTMLElement>("[data-drop-target]"))
          .find(Boolean);
        setSelected(null);
        if (target?.dataset.dropTarget) onDropRef.current(item, target.dataset.dropTarget);
      },
      onPointerCancel() {
        start.current = null;
        setDrag(null);
      },
      onClick() {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        if (disabled) return;
        setSelected((current) => (current?.key === key ? null : { key, item }));
      },
    }),
    [drag, selected]
  );

  /** Props for a drop target (a <button>): tap / Enter places the picked item. */
  const targetProps = useCallback(
    (id: string) => ({
      "data-drop-target": id,
      onClick() {
        if (!selected) return;
        const { item } = selected;
        setSelected(null);
        onDropRef.current(item, id);
      },
    }),
    [selected]
  );

  return { selected: selected?.item ?? null, selectedKey: selected?.key ?? null, dragging: drag?.key ?? null, itemProps, targetProps, clear };
}

/** Fisher–Yates; never returns the original order when it can avoid it. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    if (result.length < 2 || result.some((item, i) => item !== items[i])) return result;
  }
  return [...result.slice(1), result[0]!];
}
