/**
 * Browser storage with the programme already chosen (ALIF Pronunciation, the evaluation
 * the tests check), so its dialog does not open first. track.spec.ts tests the first visit.
 */
export const chosenTrack = (...origins: string[]) => ({
  cookies: [],
  origins: origins.map((origin) => ({ origin, localStorage: [{ name: "alif:track", value: "pronunciation" }] })),
});
