/**
 * Browser storage with the language (German) and the programme already chosen (ALIF
 * Pronunciation, the evaluation the tests check), so their dialogs do not open first.
 * track.spec.ts tests the first visit, language.spec.ts the language.
 */
export const chosenTrack = (...origins: string[]) => ({
  cookies: [],
  origins: origins.map((origin) => ({
    origin,
    localStorage: [
      { name: "alif:lang", value: "de" },
      { name: "alif:track", value: "pronunciation" },
    ],
  })),
});

/** Only the language chosen (German): the first visit of the programme dialog. */
export const chosenLanguage = (...origins: string[]) => ({
  cookies: [],
  origins: origins.map((origin) => ({ origin, localStorage: [{ name: "alif:lang", value: "de" }] })),
});
