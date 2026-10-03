# Legacy Masaar reference (test fixture)

Byte-for-byte copies of the letter-pronunciation implementation of
`Bodzawy/masaar` at commit `edea012` (`master`). Legacy Masaar is the source of
truth for letter pronunciation; `tests/parity/` runs these files side by side
with Alif's code and fails if Alif's behaviour ever differs.

**Do not edit these files.** `manifest.json` records their SHA-256 hashes and
`tests/parity/legacy-fixture.test.ts` fails on any change. To adopt a newer
Masaar version deliberately, copy the files from that commit, update the
manifest and review the parity results.

These files are not part of the application: nothing in `src/` imports them,
`tsconfig.json` excludes this folder, and the production build is checked not
to contain them. Inside this folder, `@/…` imports resolve to this folder's own
`src/` (see `vitest.config.mts`).
