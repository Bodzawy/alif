# A1 · Lektion 3 und 4 – Unit 2 des Buches („وجدي.pdf“) → Alif

Quelle: `وجدي.pdf`, 46 PDF-Seiten = Buchseiten 44–89; jede Seite als Bild gelesen (2×, Übungszeilen 4×).
Lektion 3 = „الوحدة الثانية – تقديم (١) هَلْ أَنْتَ وَجْدِي؟“ (`/a1/lesson-3`), Lektion 4 = „تقديم (٢) مَنْ أَنْتَ؟“ (`/a1/lesson-4`).
Tests: `tests/unit/a1-unit-2.test.tsx` (U2), `tests/unit/a1-dialogue.test.tsx` (DLG), `e2e/a1-unit-2.spec.ts` (E2E).
Status: ✔ umgesetzt und getestet · n. a. = im Buch ohne Inhalt bzw. nur in der Klasse möglich (mit Hinweis auf der Seite).

## Jeder Buchstabe (ر ز س ش ص ض ف ق ك ل م ن): gleicher Seitenaufbau, je 3 PDF-Seiten

| Teil im Buch | Original-Anweisung | Alif (Schritt) | Test | Status |
|---|---|---|---|---|
| (١) النطق | كَرِّرْ بَعْدَ الْمُدَرِّسِ – 9 Bildwörter (Fatha-, Kasra-, Damma-Reihe) | 1 Wörter (Laut + Wort: Bild, Deutsch, Umschrift, Anhören, Aufnehmen) | U2, E2E | ✔ |
| (٢) كتابة الحرف + (٣) النطق مع السكون | Tabelle: Anfang / Mitte / Ende / allein + Sukun-Wort | 2 Formen (Buchstabe im Wort antippen; Regelsatz bei ر ز; bei ل zusätzlich لا / لأ / الـ) | U2, E2E | ✔ |
| تدريب ١ | تَتَبَّعْ بِالْقَلَمِ | 3 Schreiben (alle Formen nachfahren, Punkte tippen) | U2, E2E | ✔ |
| تدريب ٢ | اُكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ (9 Wörter) | 4 Ergänzen (mit Bild) | U2, E2E | ✔ |
| تدريب ٣ | اِسْمَعْ … وَاكْتُبِ الْحَرْفَ النَّاقِصَ (X َ / X ِ / X ُ / X ْ) (10 Wörter) | 5 Hören | U2, E2E | ✔ |
| تدريب ٤ | اِسْمَعْ وَكَرِّرْ … وَاكْتُبِ الْحَرْفَ بِالتَّشْكِيلِ (Wortliste) | 6 Nachsprechen & schreiben | U2, E2E | ✔ |
| تدريب ٥–٧ | اُدْخُلْ إِلَى الْمَوْقِعِ | Hinweis in Schritt 6 (Verlags-Website) | U2 | n. a. |
| تدريب ٨ | اُكْتُبِ الْحَرْفَ مَعَ مَدٍّ بِالْوَاوِ / بِالْأَلِفِ / بِالْيَاءِ … اُنْطُقِ الْحَرْفَ | 7 Mit Dehnung schreiben (X ُو، X َا، X ِي) + 8 Aussprechen (X ُ X َ X ِ, bewertet) | U2, E2E | ✔ |
| تدريب ٩ + حل تدريب ٩ | اِسْمَعْ وَاكْتُبِ الْحَرْفَ النَّاقِصَ / الْكَلِمَةَ مَعَ التَّشْكِيلِ | 9 Diktat (Lösungswörter; vom Buch gedruckte Buchstaben stehen schon da) | U2, E2E | ✔ |
| تدريب ١٠ | اِقْرَأْ … أَعِدْ كِتَابَتَهَا … اُكْتُبْهَا بِحُرُوفٍ مُنْفَصِلَةٍ | 10 Getrennt schreiben (Diktatwörter anhören, lesen, Buchstaben einzeln setzen) | U2, E2E | ✔ |

| PDF | Buch | Buchstabe | Wörter (١) | Route |
|---|---|---|---|---|
| 1–3 | 44–46 | ر | رَجُل رَادْيُو رَأْس · رِسَالَة رِئَة رِجْل · رُمَّان رُخْصَة رُبْع | `/a1/lesson-3/ra` |
| 4–6 | 47–49 | ز | زَيْت زَمِيل زَهْرَة · زِير زِرّ زِرَاعَة · زُمُرُّد زُمَلَاء زُهُور | `/a1/lesson-3/zay` |
| 7–9 | 50–52 | س | سَاعَة سَيَّارَة سَيِّدَة · سِيجَارَة سِنَّارَة سِتَارَة · سُوق سُلَّم سُور | `/a1/lesson-3/sin` |
| 10–12 | 53–55 | ش | شَجَرَة شَارِع شَمْس · شِيبْسِي شِتَاء شِرَاع · شُرْطِيّ شُجَيْرَة شُبَّاك | `/a1/lesson-3/shin` |
| 13–15 | 56–58 | ص | صَارُوخ صَدِيق صَفْحَة · الصِّين صِينِيّ صِينِيَّة · صُنْدُوق صُورَة صُوَر | `/a1/lesson-3/sad` |
| 16–18 | 59–61 | ض | ضَابِط ضَيْف ضَرْب · ضِرْس ضِيَاء ضِلْع · ضُرُوس ضُبَّاط ضُيُوف | `/a1/lesson-3/dad` |
| 21–23 | 64–66 | ف | فَرَس فَاكِهَة فَصْل · فِلْفِل فِرْقَة فِيل · فُلُوس فُرْشَاة فُرَش | `/a1/lesson-4/fa` |
| 24–26 | 67–69 | ق | قَلَم قَصْر قَرْيَة · قِرْد قِصَّة قِصَص · قُرُود قُنْفُذ قُمَاش | `/a1/lesson-4/qaf` |
| 27–29 | 70–72 | ك | كَلْب كَأْس كَاهِن · كِتَاب كِيس كِيلُو · كُتُب كُوب كُرْسِيّ | `/a1/lesson-4/kaf` |
| 30–32 | 73–75 | ل | لَوْن لَيْمُون لَبَن · لِسَان لِمَاذَا؟ لِحْيَة · لُعْبَة لُبَان لُصُوص | `/a1/lesson-4/lam` |
| 33–35 | 76–78 | م | مَكْتَب مَوْز مَقْلَمَة · مِيكَانِيكِيّ مِمْحَاة مِفْتَاح · مُدِير مُسْتَشْفَى مُشْط | `/a1/lesson-4/mim` |
| 36–38 | 79–81 | ن | نَاس نَخْلَة نَجْم · نِمْرَة نِمْر نِسْنَاس · نُور نُجُوم نُوتَة | `/a1/lesson-4/nun` |

## Gespräche, Grammatik, Wiederholung

| PDF | Buch | Abschnitt | Original-Anweisung | Inhalt | Alif | Test | Status |
|---|---|---|---|---|---|---|---|
| 19 | 62 | المحادثة: هل أنت وجدي؟ حوار ١ | اِسْمَعِ الْحِوَارَ وَأَجِبْ: مَنْ فِي الصُّورَةِ؟ | شادي / وليد / وجدي, 4 Zeilen | `lesson-3/hal-anta-wajdi/step-1` Anhören, `step-2` Nachsprechen | U2, DLG, E2E | ✔ |
| 19 | 62 | حوار ٢ | ebenso | تريز / إستر / سوزي, 4 Zeilen | `step-3`, `step-4` | U2, DLG, E2E | ✔ |
| 19 | 62 | لاحظ القواعد | لِلسُّؤَالِ عَنِ الْأَشْخَاصِ | هَلْ أَنْتَ + صابر؟ / هَلْ أَنْتِ + سوزي؟ – نعم … / لا … | `step-5` Grammatik (+ Kurzcheck) | U2, E2E | ✔ |
| 19 | 62 | تدريب ١ | اِقْرَأْ كُلَّ حِوَارٍ مَعَ زَمِيلِكَ وَكَرِّرْهُ | beide Gespräche | `step-6`, `step-7` Rollenspiel (3 Sprecher) | DLG, E2E | ✔ |
| 19 | 62 | تدريب ٢ | … اِسْتَعْمِلُوا أَسْمَاءَكُمُ الْحَقِيقِيَّةَ | eigene Namen | Hinweis in `step-6` | – | n. a. |
| 20 | 63 | تدريب ٣ | اِسْمَعِ الْمُدَرِّسَ وَعَيِّنِ الْحَرْفَ الْأَوَّلَ وَالْأَخِيرَ | 11 Namen (يَحْيَى … سَارَة) | `step-8` (quiz) | U2, E2E | ✔ |
| 20 | 63 | تدريب ٤ | كَوِّنْ أَسْمَاءً مِنَ الْحُرُوفِ التَّالِيَةِ | 8 Buchstabenreihen → حبيب جرجس سيزا صابر صبحي داود سارة آسر | `step-9` | U2, E2E | ✔ |
| 20 | 63 | تدريب ٥ | اِقْسِمُوا الْفَصْلَ إِلَى فَرِيقَيْنِ … | Klassenspiel | Hinweis in `step-9` | – | n. a. |
| 20 | 63 | تدريب ٦ | اِسْتَعْمِلُوا الْأَسْمَاءَ السَّابِقَةَ لِتَكْرَارِ حِوَارَاتِ الْمُحَادَثَةِ | mit Mitschülern | Hinweis in `step-6` (Rollenspiele) | – | n. a. |
| 39 | 82 | مراجعة عامة · تدريب ١ | صِلِ الْحُرُوفَ لِتَكُونَ كَلِمَةً · صِلْ بِالْكَلِمَةِ الصَّحِيحَةِ | 7 Reihen (Beispiel مَكْتَب) | `lesson-4/muraja-amma/step-1` (match) | U2, E2E | ✔ |
| 39 | 82 | تدريب ٢ + حل | اِسْمَعْ … وَاكْتُبْ (سَ أَوْ صَ) | 10 Wörter | `step-2` | U2, E2E | ✔ |
| 39 | 82 | تدريب ٣ + حل | اِسْمَعْ … وَاكْتُبْ (دَ أَوْ ضَ) | 10 Wörter | `step-3` | U2, E2E | ✔ |
| 40 | 83 | تقديم (أ) | اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ | 6 Fragen مَنْ أَنْتَ / أَنْتِ / أَنْتُمَا ×2 / أَنْتُمْ / أَنْتُنَّ + Antworten | `lesson-4/man-anta/step-1`, `step-2` | U2, DLG, E2E | ✔ |
| 41 | 84 | تقديم (ب) | ebenso | + مَا اسْمُكَ / اسْمُكِ / اسْمَاكُمَا / أَسْمَاؤُكُمْ / أَسْمَاؤُكُنَّ | `step-3`, `step-4` | U2, DLG, E2E | ✔ |
| 42 | 85 | لاحظ القواعد ١–٣ | مَنْ (لِلْعَاقِلِ) · مَا (لِغَيْرِ الْعَاقِلِ) · لِلْإِجَابَةِ | 3 Tabellen, 6 Spalten | `step-5` (+ Kurzcheck) | U2, E2E | ✔ |
| 43 | 86 | تدريب ١ | اِقْرَأْ وَكَرِّرِ الْحِوَارَ فِي تَقْدِيمِ (أ) مَعَ زَمِيلِكَ | تقديم (أ) | `step-6` Rollenspiel (Fragender / Antwortende) | DLG, E2E | ✔ |
| 43 | 86 | تدريب ٢ | صِلِ الضَّمِيرَ بِالسُّؤَالِ الْمُنَاسِبِ | 6 Pronomen ↔ 6 Fragen | `step-7` (match) | U2, E2E | ✔ |
| 43 | 86 | تدريب ٣ | صِلِ الضَّمِيرَ بِالْإِجَابَةِ الْمُنَاسِبَةِ | أنا / نحن ↔ اسمي / أسماؤنا | `step-8` (match) | U2, E2E | ✔ |
| 43 | 86 | تدريب ٤ | اُكْتُبِ السُّؤَالَ النَّاقِصَ بِضَمِيرِ الْمُخَاطَبِ | 6 Antworten (نادية … نادين وفاطمة وزينب) | `step-9` (cloze) | U2, E2E | ✔ |
| 44 | 87 | تدريب ٥ | اُكْتُبْ سُؤَالًا وَإِجَابَةً تَحْتَ كُلِّ صُورَةٍ … | 6 Bilder | `step-10` (cloze mit Bild; Namen frei) | U2, E2E | ✔ (Teil 2 „mit Partner“: Hinweis) |
| 45 | 88 | تدريب ٦ | اُكْتُبِ الْحِوَارَ النَّاقِصَ | 6 Wechsel | `step-11` (cloze) | E2E | ✔ |
| 45 | 88 | تدريب ٧ | كَرِّرِ الْحِوَارَ فِي تَقْدِيمِ (ب) مَعَ زُمَلَائِكَ … | تقديم (ب) | `step-12` Rollenspiel | DLG, E2E | ✔ (echte Namen: Hinweis) |
| 45–46 | 88–89 | تذكر ١–٦ | – | هل · من · ما · ضمائر المخاطب · ضمائر المتكلم · تصريف الضمائر للملكية | `step-13` (Tabellen + Kurzcheck) | U2, E2E | ✔ |

Seiten 1–46 sind damit vollständig erfasst (PDF 19–20, 39–46: Gespräche, Wiederholung, Grammatik; alle übrigen Seiten: die 12 Buchstaben).
