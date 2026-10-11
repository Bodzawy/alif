// Shared by the letter writing sets (ب ت ث ج ح خ): a dot stroke is a small
// circle around the dot's centre (tap target, see TRACE_TOL.dot); the arrow is
// not drawn for dots.

/** A dot: a small circle around its centre. */
export const dot = (x: number, y: number) => `M${x + 3} ${y} A3 3 0 1 1 ${x - 3} ${y} A3 3 0 1 1 ${x + 3} ${y}`;

/** A dot stroke at (x, y); `label` completes "Gut! Jetzt {label}.". */
export const dotStroke = (label: string, x: number, y: number) => ({ label, dot: true, arrow: { a: 0, b: 0, off: 0 }, d: dot(x, y) });
