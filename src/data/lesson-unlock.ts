/**
 * Lesson order within a level (A1).
 *   true  – lesson N opens only after lesson N-1 is completed, like A0; lesson 1 is always open.
 *   false – every lesson is open.
 * The lesson list, the lesson page and its intro page all follow this flag.
 */
export const LESSONS_UNLOCK_IN_ORDER = true;
