// `npm run lessons:status` – one line per lesson: words, audio, pictures and
// intro video. Exits with code 1 when any lesson has a problem.
import { checkAllLessons, crossLessonIssues, WORDS_PER_LESSON } from "./lesson-checks";

const yes = (ok: boolean) => (ok ? "ok" : "MISSING");

const rows = checkAllLessons().map((check) => ({
  lesson: `${check.level}/${check.slug}`,
  letter: `${check.glyph} ${check.name}`,
  words: check.wordIssues.length === 0 ? `ok (${WORDS_PER_LESSON})` : "PROBLEM",
  audio: yes(check.audioIssues.length === 0),
  pictures: yes(check.pictureIssues.length === 0),
  intro: check.introVideo ? (check.introIssues.length === 0 ? "yes" : "BROKEN") : "no",
  issues: [...check.wordIssues, ...check.audioIssues, ...check.pictureIssues, ...check.introIssues],
}));

const headers = ["lesson", "letter", "words", "audio", "pictures", "intro"] as const;
const widths = headers.map((header) => Math.max(header.length, ...rows.map((row) => [...row[header]].length)));
const line = (cells: string[]) => cells.map((cell, i) => cell + " ".repeat(widths[i]! - [...cell].length)).join(" | ");

console.log(line([...headers]));
console.log(widths.map((width) => "-".repeat(width)).join("-|-"));
for (const row of rows) console.log(line(headers.map((header) => row[header])));

const problems = rows.flatMap((row) => row.issues.map((issue) => `${row.lesson}: ${issue}`));
problems.push(...crossLessonIssues());

console.log("");
console.log(`${rows.length} lessons · intro videos: ${rows.filter((row) => row.intro === "yes").length}`);
console.log("Audio = the text is accepted by /api/tts (Azure text-to-speech at runtime); no audio files are needed.");
if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exitCode = 1;
} else {
  console.log("No problems found.");
}
