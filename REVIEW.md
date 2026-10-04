# REVIEW – A1 lessons 2–28

Everything below was written without a native speaker and **needs native-speaker review** before release.
Tick a box when the item has been checked (or note the correction next to it). Lesson 1 (Alif) was already reviewed and is not listed.

How to check in the app: `npm run dev`, open `/a1/lesson-N` (lessons unlock in order; to see them all at once set
`LESSONS_UNLOCK_IN_ORDER = false` in `src/data/lesson-unlock.ts` while reviewing). "Anhören" plays Azure TTS of the
voweled text, so wrong harakat are audible.

Source files: `src/data/lessons/a1/lesson-N.ts` (texts, words), `src/lib/pronunciation/vocabulary_conditions.json`
(word rules, generated from the unvoweled target), `public/images/vocabulary/*.svg` (pictures).

## 1. Words and harakat (81) – needs native-speaker review

For each word check: common/simple enough for beginners, starts with the lesson's letter, **full harakat correct**,
transliteration, German meaning with article, and that the pausal form (no case ending) is what should be taught.

### Lektion 2 · ب Ba

- [ ] **بَيْت** (target `بيت`) · *bait* · das Haus — needs native-speaker review
- [ ] **بَاب** (target `باب`) · *bāb* · die Tür — needs native-speaker review
- [ ] **بَطَّة** (target `بطة`) · *baṭṭa* · die Ente — needs native-speaker review

### Lektion 3 · ت Ta

- [ ] **تُفَّاحَة** (target `تفاحة`) · *tuffāḥa* · der Apfel — needs native-speaker review
- [ ] **تِمْسَاح** (target `تمساح`) · *timsāḥ* · das Krokodil — needs native-speaker review
- [ ] **تَاج** (target `تاج`) · *tādsch* · die Krone — needs native-speaker review

### Lektion 4 · ث Tha

- [ ] **ثَعْلَب** (target `ثعلب`) · *thaʿlab* · der Fuchs — needs native-speaker review
- [ ] **ثُوم** (target `ثوم`) · *thūm* · der Knoblauch — needs native-speaker review
- [ ] **ثَلْج** (target `ثلج`) · *thaldsch* · der Schnee — needs native-speaker review

### Lektion 5 · ج Dschim

- [ ] **جَمَل** (target `جمل`) · *dschamal* · das Kamel — needs native-speaker review
- [ ] **جَزَرَة** (target `جزرة`) · *dschazara* · die Karotte — needs native-speaker review
- [ ] **جَبَل** (target `جبل`) · *dschabal* · der Berg — needs native-speaker review

### Lektion 6 · ح Ḥa

- [ ] **حِصَان** (target `حصان`) · *ḥiṣān* · das Pferd — needs native-speaker review
- [ ] **حُوت** (target `حوت`) · *ḥūt* · der Wal — needs native-speaker review
- [ ] **حَلِيب** (target `حليب`) · *ḥalīb* · die Milch — needs native-speaker review

### Lektion 7 · خ Cha

- [ ] **خُبْز** (target `خبز`) · *chubz* · das Brot — needs native-speaker review
- [ ] **خَرُوف** (target `خروف`) · *charūf* · das Schaf — needs native-speaker review
- [ ] **خِيَار** (target `خيار`) · *chijār* · die Gurke — needs native-speaker review

### Lektion 8 · د Dal

- [ ] **دُبّ** (target `دب`) · *dubb* · der Bär — needs native-speaker review
- [ ] **دَجَاجَة** (target `دجاجة`) · *dadschādscha* · das Huhn — needs native-speaker review
- [ ] **دَرَّاجَة** (target `دراجة`) · *darrādscha* · das Fahrrad — needs native-speaker review

### Lektion 9 · ذ Dhal

- [ ] **ذِئْب** (target `ذئب`) · *dhiʾb* · der Wolf — needs native-speaker review
- [ ] **ذُرَة** (target `ذرة`) · *dhura* · der Mais — needs native-speaker review
- [ ] **ذُبَابَة** (target `ذبابة`) · *dhubāba* · die Fliege — needs native-speaker review

### Lektion 10 · ر Ra

- [ ] **رُمَّانَة** (target `رمانة`) · *rummāna* · der Granatapfel — needs native-speaker review
- [ ] **رِيشَة** (target `ريشة`) · *rīscha* · die Feder — needs native-speaker review
- [ ] **رَجُل** (target `رجل`) · *radschul* · der Mann — needs native-speaker review

### Lektion 11 · ز Zay

- [ ] **زَرَافَة** (target `زرافة`) · *zarāfa* · die Giraffe — needs native-speaker review
- [ ] **زَيْتُونَة** (target `زيتونة`) · *zaitūna* · die Olive — needs native-speaker review
- [ ] **زَهْرَة** (target `زهرة`) · *zahra* · die Blume — needs native-speaker review

### Lektion 12 · س Sin

- [ ] **سَمَكَة** (target `سمكة`) · *samaka* · der Fisch — needs native-speaker review
- [ ] **سَيَّارَة** (target `سيارة`) · *sajjāra* · das Auto — needs native-speaker review
- [ ] **سَاعَة** (target `ساعة`) · *sāʿa* · die Uhr — needs native-speaker review

### Lektion 13 · ش Schin

- [ ] **شَمْس** (target `شمس`) · *schams* · die Sonne — needs native-speaker review
- [ ] **شَجَرَة** (target `شجرة`) · *schadschara* · der Baum — needs native-speaker review
- [ ] **شَاي** (target `شاي`) · *schāi* · der Tee — needs native-speaker review

### Lektion 14 · ص Ṣad

- [ ] **صَقْر** (target `صقر`) · *ṣaqr* · der Falke — needs native-speaker review
- [ ] **صُنْدُوق** (target `صندوق`) · *ṣundūq* · die Kiste — needs native-speaker review
- [ ] **صَابُون** (target `صابون`) · *ṣābūn* · die Seife — needs native-speaker review

### Lektion 15 · ض Ḍad

- [ ] **ضِفْدَع** (target `ضفدع`) · *ḍifdaʿ* · der Frosch — needs native-speaker review
- [ ] **ضِرْس** (target `ضرس`) · *ḍirs* · der Backenzahn — needs native-speaker review
- [ ] **ضَبُع** (target `ضبع`) · *ḍabuʿ* · die Hyäne — needs native-speaker review

### Lektion 16 · ط Ṭa

- [ ] **طَائِرَة** (target `طائرة`) · *ṭāʾira* · das Flugzeug — needs native-speaker review
- [ ] **طَبْل** (target `طبل`) · *ṭabl* · die Trommel — needs native-speaker review
- [ ] **طَاوُوس** (target `طاووس`) · *ṭāwūs* · der Pfau — needs native-speaker review

### Lektion 17 · ظ Ẓa

- [ ] **ظَرْف** (target `ظرف`) · *ẓarf* · der Briefumschlag — needs native-speaker review
- [ ] **ظُفْر** (target `ظفر`) · *ẓufr* · der Fingernagel — needs native-speaker review
- [ ] **ظَبْي** (target `ظبي`) · *ẓabj* · die Gazelle — needs native-speaker review

### Lektion 18 · ع ʿAin

- [ ] **عِنَب** (target `عنب`) · *ʿinab* · die Weintrauben — needs native-speaker review
- [ ] **عُصْفُور** (target `عصفور`) · *ʿuṣfūr* · der Spatz — needs native-speaker review
- [ ] **عَسَل** (target `عسل`) · *ʿasal* · der Honig — needs native-speaker review

### Lektion 19 · غ Ghain

- [ ] **غُرَاب** (target `غراب`) · *ghurāb* · der Rabe — needs native-speaker review
- [ ] **غَيْمَة** (target `غيمة`) · *ghaima* · die Wolke — needs native-speaker review
- [ ] **غَسَّالَة** (target `غسالة`) · *ghassāla* · die Waschmaschine — needs native-speaker review

### Lektion 20 · ف Fa

- [ ] **فِيل** (target `فيل`) · *fīl* · der Elefant — needs native-speaker review
- [ ] **فَرَاشَة** (target `فراشة`) · *farāscha* · der Schmetterling — needs native-speaker review
- [ ] **فَرَاوِلَة** (target `فراولة`) · *farāwila* · die Erdbeere — needs native-speaker review

### Lektion 21 · ق Qaf

- [ ] **قِطَّة** (target `قطة`) · *qiṭṭa* · die Katze — needs native-speaker review
- [ ] **قَمَر** (target `قمر`) · *qamar* · der Mond — needs native-speaker review
- [ ] **قَلَم** (target `قلم`) · *qalam* · der Stift — needs native-speaker review

### Lektion 22 · ك Kaf

- [ ] **كَلْب** (target `كلب`) · *kalb* · der Hund — needs native-speaker review
- [ ] **كِتَاب** (target `كتاب`) · *kitāb* · das Buch — needs native-speaker review
- [ ] **كُرَة** (target `كرة`) · *kura* · der Ball — needs native-speaker review

### Lektion 23 · ل Lam

- [ ] **لَيْمُونَة** (target `ليمونة`) · *laimūna* · die Zitrone — needs native-speaker review
- [ ] **لِسَان** (target `لسان`) · *lisān* · die Zunge — needs native-speaker review
- [ ] **لَقْلَق** (target `لقلق`) · *laqlaq* · der Storch — needs native-speaker review

### Lektion 24 · م Mim

- [ ] **مَوْزَة** (target `موزة`) · *mauza* · die Banane — needs native-speaker review
- [ ] **مِفْتَاح** (target `مفتاح`) · *miftāḥ* · der Schlüssel — needs native-speaker review
- [ ] **مِظَلَّة** (target `مظلة`) · *miẓalla* · der Regenschirm — needs native-speaker review

### Lektion 25 · ن Nun

- [ ] **نَمِر** (target `نمر`) · *namir* · der Tiger — needs native-speaker review
- [ ] **نَحْلَة** (target `نحلة`) · *naḥla* · die Biene — needs native-speaker review
- [ ] **نَجْمَة** (target `نجمة`) · *nadschma* · der Stern — needs native-speaker review

### Lektion 26 · ه Ha

- [ ] **هِلَال** (target `هلال`) · *hilāl* · der Halbmond — needs native-speaker review
- [ ] **هَاتِف** (target `هاتف`) · *hātif* · das Telefon — needs native-speaker review
- [ ] **هَرَم** (target `هرم`) · *haram* · die Pyramide — needs native-speaker review

### Lektion 27 · و Waw

- [ ] **وَرْدَة** (target `وردة`) · *warda* · die Rose — needs native-speaker review
- [ ] **وَلَد** (target `ولد`) · *walad* · der Junge — needs native-speaker review
- [ ] **وِسَادَة** (target `وسادة`) · *wisāda* · das Kissen — needs native-speaker review

### Lektion 28 · ي Ya

- [ ] **يَد** (target `يد`) · *jad* · die Hand — needs native-speaker review
- [ ] **يَقْطِين** (target `يقطين`) · *jaqṭīn* · der Kürbis — needs native-speaker review
- [ ] **يَمَامَة** (target `يمامة`) · *jamāma* · die Taube — needs native-speaker review

## 2. Letter texts (27) – needs native-speaker review

German title, subtitle, sound ("Laut"), sound explanation (soundHint) and the four letter forms.
The letter exercise itself (target, voweled name, rules) is unchanged from A0 / Masaar.

### Lektion 2 · ب
- [ ] Title: Der Buchstabe Ba
- [ ] Subtitle: Das arabische „b“ – und drei Wörter, die mit Ba beginnen.
- [ ] Laut: „b“ · Arabic name: بَاء
- [ ] soundHint: Wie das deutsche „b“ in „Ball“ – aber immer weich und stimmhaft, auch am Wortende (nie wie „p“).
- [ ] Forms: Allein ب · Anfang بـ · Mitte ـبـ · Ende ـب

### Lektion 3 · ت
- [ ] Title: Der Buchstabe Ta · das normale T
- [ ] Subtitle: Das normale T – und drei Wörter, die mit Ta beginnen.
- [ ] Laut: „t“ · Arabic name: تَاء
- [ ] soundHint: Wie das deutsche „t“ in „Tag“, nur ohne den kleinen Hauch danach. Die Zungenspitze liegt an den oberen Schneidezähnen.
- [ ] Forms: Allein ت · Anfang تـ · Mitte ـتـ · Ende ـت

### Lektion 4 · ث
- [ ] Title: Der Buchstabe Tha
- [ ] Subtitle: Das „th“ wie im englischen „think“ – und drei Wörter, die mit Tha beginnen.
- [ ] Laut: „th“ · Arabic name: ثَاء
- [ ] soundHint: Wie das englische „th“ in „think“: Die Zungenspitze liegt leicht zwischen den Zähnen, die Luft strömt stimmlos hindurch.
- [ ] Forms: Allein ث · Anfang ثـ · Mitte ـثـ · Ende ـث

### Lektion 5 · ج
- [ ] Title: Der Buchstabe Dschim
- [ ] Subtitle: Das „dsch“ wie in „Dschungel“ – und drei Wörter, die mit Dschim beginnen.
- [ ] Laut: „dsch“ · Arabic name: جِيم
- [ ] soundHint: Wie „dsch“ in „Dschungel“. In Ägypten klingt es wie ein hartes „g“ – hier lernst du die Hochsprache mit „dsch“.
- [ ] Forms: Allein ج · Anfang جـ · Mitte ـجـ · Ende ـج

### Lektion 6 · ح
- [ ] Title: Der Buchstabe Ḥa · das gehauchte H
- [ ] Subtitle: Das gehauchte H aus der Kehle – und drei Wörter, die mit Ḥa beginnen.
- [ ] Laut: „ḥ“ · Arabic name: حَاء
- [ ] soundHint: Ein kräftig gehauchtes „h“ aus der verengten Kehle – wie beim Anhauchen einer Brille, nur gepresster. Einen solchen Laut gibt es im Deutschen nicht.
- [ ] Forms: Allein ح · Anfang حـ · Mitte ـحـ · Ende ـح

### Lektion 7 · خ
- [ ] Title: Der Buchstabe Cha
- [ ] Subtitle: Das „ch“ wie in „Bach“ – und drei Wörter, die mit Cha beginnen.
- [ ] Laut: „ch“ · Arabic name: خَاء
- [ ] soundHint: Wie das „ch“ in „Bach“ oder „lachen“ – ein rauer Reibelaut hinten am Gaumen.
- [ ] Forms: Allein خ · Anfang خـ · Mitte ـخـ · Ende ـخ

### Lektion 8 · د
- [ ] Title: Der Buchstabe Dal
- [ ] Subtitle: Das arabische „d“ – und drei Wörter, die mit Dal beginnen.
- [ ] Laut: „d“ · Arabic name: دَال
- [ ] soundHint: Wie das deutsche „d“ in „Dach“ – auch am Wortende weich (nie wie „t“).
- [ ] Forms: Allein د · Anfang د · Mitte ـد · Ende ـد

### Lektion 9 · ذ
- [ ] Title: Der Buchstabe Dhal
- [ ] Subtitle: Das stimmhafte „th“ wie im englischen „this“ – und drei Wörter, die mit Dhal beginnen.
- [ ] Laut: „dh“ · Arabic name: ذَال
- [ ] soundHint: Wie das englische „th“ in „this“: Die Zungenspitze liegt zwischen den Zähnen, dabei schwingt die Stimme mit.
- [ ] Forms: Allein ذ · Anfang ذ · Mitte ـذ · Ende ـذ

### Lektion 10 · ر
- [ ] Title: Der Buchstabe Ra
- [ ] Subtitle: Das gerollte „r“ – und drei Wörter, die mit Ra beginnen.
- [ ] Laut: „r“ · Arabic name: رَاء
- [ ] soundHint: Ein gerolltes „r“ mit der Zungenspitze, wie im Italienischen oder Spanischen – nicht das deutsche Rachen-„r“.
- [ ] Forms: Allein ر · Anfang ر · Mitte ـر · Ende ـر

### Lektion 11 · ز
- [ ] Title: Der Buchstabe Zay
- [ ] Subtitle: Das summende „s“ – und drei Wörter, die mit Zay beginnen.
- [ ] Laut: „z“ · Arabic name: زَاي
- [ ] soundHint: Ein summendes, stimmhaftes „s“ wie in „Sonne“ – nicht wie das deutsche „z“ in „Zug“.
- [ ] Forms: Allein ز · Anfang ز · Mitte ـز · Ende ـز

### Lektion 12 · س
- [ ] Title: Der Buchstabe Sin
- [ ] Subtitle: Das scharfe „s“ – und drei Wörter, die mit Sin beginnen.
- [ ] Laut: „s“ · Arabic name: سِين
- [ ] soundHint: Ein scharfes, stimmloses „s“ wie in „Bus“ oder „Fluss“.
- [ ] Forms: Allein س · Anfang سـ · Mitte ـسـ · Ende ـس

### Lektion 13 · ش
- [ ] Title: Der Buchstabe Schin
- [ ] Subtitle: Das „sch“ wie in „Schule“ – und drei Wörter, die mit Schin beginnen.
- [ ] Laut: „sch“ · Arabic name: شِين
- [ ] soundHint: Wie das deutsche „sch“ in „Schule“.
- [ ] Forms: Allein ش · Anfang شـ · Mitte ـشـ · Ende ـش

### Lektion 14 · ص
- [ ] Title: Der Buchstabe Ṣad
- [ ] Subtitle: Das dunkle S – und drei Wörter, die mit Ṣad beginnen.
- [ ] Laut: „ṣ“ · Arabic name: صَاد
- [ ] soundHint: Ein dunkles, „schweres“ s: Die Zungenspitze bildet ein „s“, der hintere Zungenrücken hebt sich dabei an. Dadurch klingen die Vokale danach dunkler.
- [ ] Forms: Allein ص · Anfang صـ · Mitte ـصـ · Ende ـص

### Lektion 15 · ض
- [ ] Title: Der Buchstabe Ḍad
- [ ] Subtitle: Das dunkle D – und drei Wörter, die mit Ḍad beginnen.
- [ ] Laut: „ḍ“ · Arabic name: ضَاد
- [ ] soundHint: Ein dunkles, „schweres“ d: wie „d“, aber der hintere Zungenrücken hebt sich an, und die Vokale danach klingen dunkler. Arabisch heißt auch „die Sprache des Ḍad“.
- [ ] Forms: Allein ض · Anfang ضـ · Mitte ـضـ · Ende ـض

### Lektion 16 · ط
- [ ] Title: Der Buchstabe Ṭa · das dunkle T
- [ ] Subtitle: Das dunkle T – und drei Wörter, die mit Ṭa beginnen.
- [ ] Laut: „ṭ“ · Arabic name: طَاء
- [ ] soundHint: Ein dunkles, „schweres“ t ohne Hauch: wie „t“, aber der hintere Zungenrücken hebt sich an. Die Vokale danach klingen dunkler.
- [ ] Forms: Allein ط · Anfang طـ · Mitte ـطـ · Ende ـط

### Lektion 17 · ظ
- [ ] Title: Der Buchstabe Ẓa
- [ ] Subtitle: Das dunkle Dh – und drei Wörter, die mit Ẓa beginnen.
- [ ] Laut: „ẓ“ · Arabic name: ظَاء
- [ ] soundHint: Ein dunkles, „schweres“ dh: Die Zungenspitze liegt zwischen den Zähnen wie beim englischen „th“ in „this“, dazu hebt sich der hintere Zungenrücken. Die Vokale danach klingen dunkler.
- [ ] Forms: Allein ظ · Anfang ظـ · Mitte ـظـ · Ende ـظ

### Lektion 18 · ع
- [ ] Title: Der Buchstabe ʿAin
- [ ] Subtitle: Der gepresste Kehllaut – und drei Wörter, die mit ʿAin beginnen.
- [ ] Laut: „ʿ“ · Arabic name: عَيْن
- [ ] soundHint: Ein gepresster, stimmhafter Laut tief aus der Kehle, den es im Deutschen nicht gibt: Die Kehle wird kurz eng, die Stimme klingt dabei weiter. Hör ihn dir oft an und ahme ihn nach.
- [ ] Forms: Allein ع · Anfang عـ · Mitte ـعـ · Ende ـع

### Lektion 19 · غ
- [ ] Title: Der Buchstabe Ghain
- [ ] Subtitle: Das gegurgelte „r“ – und drei Wörter, die mit Ghain beginnen.
- [ ] Laut: „gh“ · Arabic name: غَيْن
- [ ] soundHint: Wie ein weiches, gegurgeltes Rachen-„r“, ähnlich dem französischen „r“ in „Paris“ – die stimmhafte Schwester von Cha (خ).
- [ ] Forms: Allein غ · Anfang غـ · Mitte ـغـ · Ende ـغ

### Lektion 20 · ف
- [ ] Title: Der Buchstabe Fa
- [ ] Subtitle: Das arabische „f“ – und drei Wörter, die mit Fa beginnen.
- [ ] Laut: „f“ · Arabic name: فَاء
- [ ] soundHint: Wie das deutsche „f“ in „Fisch“.
- [ ] Forms: Allein ف · Anfang فـ · Mitte ـفـ · Ende ـف

### Lektion 21 · ق
- [ ] Title: Der Buchstabe Qaf
- [ ] Subtitle: Das tiefe K aus dem Rachen – und drei Wörter, die mit Qaf beginnen.
- [ ] Laut: „q“ · Arabic name: قَاف
- [ ] soundHint: Ein „k“ ganz hinten im Rachen, am Zäpfchen gebildet – tiefer als das deutsche „k“ und ohne Hauch.
- [ ] Forms: Allein ق · Anfang قـ · Mitte ـقـ · Ende ـق

### Lektion 22 · ك
- [ ] Title: Der Buchstabe Kaf
- [ ] Subtitle: Das arabische „k“ – und drei Wörter, die mit Kaf beginnen.
- [ ] Laut: „k“ · Arabic name: كَاف
- [ ] soundHint: Wie das deutsche „k“ in „Kind“.
- [ ] Forms: Allein ك · Anfang كـ · Mitte ـكـ · Ende ـك

### Lektion 23 · ل
- [ ] Title: Der Buchstabe Lam
- [ ] Subtitle: Das arabische „l“ – und drei Wörter, die mit Lam beginnen.
- [ ] Laut: „l“ · Arabic name: لَام
- [ ] soundHint: Wie das deutsche „l“ in „Licht“.
- [ ] Forms: Allein ل · Anfang لـ · Mitte ـلـ · Ende ـل

### Lektion 24 · م
- [ ] Title: Der Buchstabe Mim
- [ ] Subtitle: Das arabische „m“ – und drei Wörter, die mit Mim beginnen.
- [ ] Laut: „m“ · Arabic name: مِيم
- [ ] soundHint: Wie das deutsche „m“ in „Mama“.
- [ ] Forms: Allein م · Anfang مـ · Mitte ـمـ · Ende ـم

### Lektion 25 · ن
- [ ] Title: Der Buchstabe Nun
- [ ] Subtitle: Das arabische „n“ – und drei Wörter, die mit Nun beginnen.
- [ ] Laut: „n“ · Arabic name: نُون
- [ ] soundHint: Wie das deutsche „n“ in „Nase“.
- [ ] Forms: Allein ن · Anfang نـ · Mitte ـنـ · Ende ـن

### Lektion 26 · ه
- [ ] Title: Der Buchstabe Ha · das leichte H
- [ ] Subtitle: Das leichte H – und drei Wörter, die mit Ha beginnen.
- [ ] Laut: „h“ · Arabic name: هَاء
- [ ] soundHint: Wie das deutsche „h“ in „Haus“ – leicht gehaucht, aber auch in der Wortmitte und am Wortende hörbar.
- [ ] Forms: Allein ه · Anfang هـ · Mitte ـهـ · Ende ـه

### Lektion 27 · و
- [ ] Title: Der Buchstabe Waw
- [ ] Subtitle: Das „w“ wie im englischen „water“ – und drei Wörter, die mit Waw beginnen.
- [ ] Laut: „w“ · Arabic name: وَاو
- [ ] soundHint: Wie das englische „w“ in „water“, mit gerundeten Lippen – nicht wie das deutsche „w“. Als langer Vokal klingt es wie „u“.
- [ ] Forms: Allein و · Anfang و · Mitte ـو · Ende ـو

### Lektion 28 · ي
- [ ] Title: Der Buchstabe Ya
- [ ] Subtitle: Das „j“ wie in „ja“ – und drei Wörter, die mit Ya beginnen.
- [ ] Laut: „j“ · Arabic name: يَاء
- [ ] soundHint: Wie das deutsche „j“ in „ja“. Als langer Vokal klingt es wie „i“.
- [ ] Forms: Allein ي · Anfang يـ · Mitte ـيـ · Ende ـي

## 3. Pictures (81) – check visually

Hand-drawn SVGs in the style of lesson 1 (400×300). Check that each one is instantly recognisable as the word and
fits the German meaning. Open them in the browser or look at `/a1/lesson-N`.

- [ ] L2 `public/images/vocabulary/bait.svg` — das Haus (بَيْت) — alt: "Ein kleines Haus mit rotem Dach"
- [ ] L2 `public/images/vocabulary/bab.svg` — die Tür (بَاب) — alt: "Eine geschlossene Holztür"
- [ ] L2 `public/images/vocabulary/batta.svg` — die Ente (بَطَّة) — alt: "Eine gelbe Ente auf dem Wasser"
- [ ] L3 `public/images/vocabulary/tuffaha.svg` — der Apfel (تُفَّاحَة) — alt: "Ein roter Apfel mit Blatt"
- [ ] L3 `public/images/vocabulary/timsah.svg` — das Krokodil (تِمْسَاح) — alt: "Ein grünes Krokodil"
- [ ] L3 `public/images/vocabulary/taj.svg` — die Krone (تَاج) — alt: "Eine goldene Krone"
- [ ] L4 `public/images/vocabulary/thalab.svg` — der Fuchs (ثَعْلَب) — alt: "Ein roter Fuchs"
- [ ] L4 `public/images/vocabulary/thum.svg` — der Knoblauch (ثُوم) — alt: "Eine Knolle Knoblauch"
- [ ] L4 `public/images/vocabulary/thalj.svg` — der Schnee (ثَلْج) — alt: "Schneeflocken über einer verschneiten Landschaft"
- [ ] L5 `public/images/vocabulary/jamal.svg` — das Kamel (جَمَل) — alt: "Ein Kamel in der Wüste"
- [ ] L5 `public/images/vocabulary/jazara.svg` — die Karotte (جَزَرَة) — alt: "Eine orange Karotte mit grünem Kraut"
- [ ] L5 `public/images/vocabulary/jabal.svg` — der Berg (جَبَل) — alt: "Ein Berg mit schneebedeckter Spitze"
- [ ] L6 `public/images/vocabulary/hisan.svg` — das Pferd (حِصَان) — alt: "Ein braunes Pferd"
- [ ] L6 `public/images/vocabulary/hut.svg` — der Wal (حُوت) — alt: "Ein blauer Wal im Meer"
- [ ] L6 `public/images/vocabulary/halib.svg` — die Milch (حَلِيب) — alt: "Ein Glas Milch"
- [ ] L7 `public/images/vocabulary/khubz.svg` — das Brot (خُبْز) — alt: "Ein Laib Brot"
- [ ] L7 `public/images/vocabulary/kharuf.svg` — das Schaf (خَرُوف) — alt: "Ein weißes Schaf auf der Wiese"
- [ ] L7 `public/images/vocabulary/khiyar.svg` — die Gurke (خِيَار) — alt: "Eine grüne Gurke"
- [ ] L8 `public/images/vocabulary/dubb.svg` — der Bär (دُبّ) — alt: "Ein brauner Bär"
- [ ] L8 `public/images/vocabulary/dajaja.svg` — das Huhn (دَجَاجَة) — alt: "Ein Huhn"
- [ ] L8 `public/images/vocabulary/darraja.svg` — das Fahrrad (دَرَّاجَة) — alt: "Ein Fahrrad"
- [ ] L9 `public/images/vocabulary/dhib.svg` — der Wolf (ذِئْب) — alt: "Ein grauer Wolf heult den Mond an"
- [ ] L9 `public/images/vocabulary/dhura.svg` — der Mais (ذُرَة) — alt: "Ein Maiskolben"
- [ ] L9 `public/images/vocabulary/dhubaba.svg` — die Fliege (ذُبَابَة) — alt: "Eine Fliege mit durchsichtigen Flügeln"
- [ ] L10 `public/images/vocabulary/rummana.svg` — der Granatapfel (رُمَّانَة) — alt: "Ein Granatapfel, aufgeschnitten mit roten Kernen"
- [ ] L10 `public/images/vocabulary/risha.svg` — die Feder (رِيشَة) — alt: "Eine Feder"
- [ ] L10 `public/images/vocabulary/rajul.svg` — der Mann (رَجُل) — alt: "Ein Mann mit Bart"
- [ ] L11 `public/images/vocabulary/zarafa.svg` — die Giraffe (زَرَافَة) — alt: "Eine Giraffe"
- [ ] L11 `public/images/vocabulary/zaituna.svg` — die Olive (زَيْتُونَة) — alt: "Grüne Oliven an einem Zweig"
- [ ] L11 `public/images/vocabulary/zahra.svg` — die Blume (زَهْرَة) — alt: "Eine Blume"
- [ ] L12 `public/images/vocabulary/samaka.svg` — der Fisch (سَمَكَة) — alt: "Ein Fisch im Wasser"
- [ ] L12 `public/images/vocabulary/sayyara.svg` — das Auto (سَيَّارَة) — alt: "Ein rotes Auto"
- [ ] L12 `public/images/vocabulary/saa.svg` — die Uhr (سَاعَة) — alt: "Eine Wanduhr"
- [ ] L13 `public/images/vocabulary/shams.svg` — die Sonne (شَمْس) — alt: "Eine lachende Sonne"
- [ ] L13 `public/images/vocabulary/shajara.svg` — der Baum (شَجَرَة) — alt: "Ein Baum mit grüner Krone"
- [ ] L13 `public/images/vocabulary/shay.svg` — der Tee (شَاي) — alt: "Ein Glas Tee"
- [ ] L14 `public/images/vocabulary/saqr.svg` — der Falke (صَقْر) — alt: "Ein Falke"
- [ ] L14 `public/images/vocabulary/sunduq.svg` — die Kiste (صُنْدُوق) — alt: "Eine Holzkiste"
- [ ] L14 `public/images/vocabulary/sabun.svg` — die Seife (صَابُون) — alt: "Ein Stück Seife mit Schaumblasen"
- [ ] L15 `public/images/vocabulary/difda.svg` — der Frosch (ضِفْدَع) — alt: "Ein grüner Frosch auf einem Seerosenblatt"
- [ ] L15 `public/images/vocabulary/dirs.svg` — der Backenzahn (ضِرْس) — alt: "Ein Backenzahn"
- [ ] L15 `public/images/vocabulary/dabu.svg` — die Hyäne (ضَبُع) — alt: "Eine gefleckte Hyäne"
- [ ] L16 `public/images/vocabulary/taira.svg` — das Flugzeug (طَائِرَة) — alt: "Ein Flugzeug am Himmel"
- [ ] L16 `public/images/vocabulary/tabl.svg` — die Trommel (طَبْل) — alt: "Eine Trommel mit zwei Schlägeln"
- [ ] L16 `public/images/vocabulary/tawus.svg` — der Pfau (طَاوُوس) — alt: "Ein Pfau mit aufgefächerten Federn"
- [ ] L17 `public/images/vocabulary/zarf.svg` — der Briefumschlag (ظَرْف) — alt: "Ein Briefumschlag"
- [ ] L17 `public/images/vocabulary/zufr.svg` — der Fingernagel (ظُفْر) — alt: "Ein Finger mit Fingernagel"
- [ ] L17 `public/images/vocabulary/zaby.svg` — die Gazelle (ظَبْي) — alt: "Eine Gazelle"
- [ ] L18 `public/images/vocabulary/inab.svg` — die Weintrauben (عِنَب) — alt: "Eine Rebe mit lila Weintrauben"
- [ ] L18 `public/images/vocabulary/usfur.svg` — der Spatz (عُصْفُور) — alt: "Ein kleiner Spatz auf einem Ast"
- [ ] L18 `public/images/vocabulary/asal.svg` — der Honig (عَسَل) — alt: "Ein Glas Honig"
- [ ] L19 `public/images/vocabulary/ghurab.svg` — der Rabe (غُرَاب) — alt: "Ein schwarzer Rabe"
- [ ] L19 `public/images/vocabulary/ghaima.svg` — die Wolke (غَيْمَة) — alt: "Eine weiße Wolke am blauen Himmel"
- [ ] L19 `public/images/vocabulary/ghassala.svg` — die Waschmaschine (غَسَّالَة) — alt: "Eine Waschmaschine"
- [ ] L20 `public/images/vocabulary/fil.svg` — der Elefant (فِيل) — alt: "Ein grauer Elefant"
- [ ] L20 `public/images/vocabulary/farasha.svg` — der Schmetterling (فَرَاشَة) — alt: "Ein bunter Schmetterling"
- [ ] L20 `public/images/vocabulary/farawila.svg` — die Erdbeere (فَرَاوِلَة) — alt: "Eine rote Erdbeere"
- [ ] L21 `public/images/vocabulary/qitta.svg` — die Katze (قِطَّة) — alt: "Eine Katze"
- [ ] L21 `public/images/vocabulary/qamar.svg` — der Mond (قَمَر) — alt: "Ein Vollmond am Nachthimmel"
- [ ] L21 `public/images/vocabulary/qalam.svg` — der Stift (قَلَم) — alt: "Ein Bleistift"
- [ ] L22 `public/images/vocabulary/kalb.svg` — der Hund (كَلْب) — alt: "Ein Hund"
- [ ] L22 `public/images/vocabulary/kitab.svg` — das Buch (كِتَاب) — alt: "Ein aufgeschlagenes Buch"
- [ ] L22 `public/images/vocabulary/kura.svg` — der Ball (كُرَة) — alt: "Ein bunter Ball"
- [ ] L23 `public/images/vocabulary/laimuna.svg` — die Zitrone (لَيْمُونَة) — alt: "Eine gelbe Zitrone"
- [ ] L23 `public/images/vocabulary/lisan.svg` — die Zunge (لِسَان) — alt: "Ein Gesicht, das die Zunge herausstreckt"
- [ ] L23 `public/images/vocabulary/laqlaq.svg` — der Storch (لَقْلَق) — alt: "Ein Storch"
- [ ] L24 `public/images/vocabulary/mauza.svg` — die Banane (مَوْزَة) — alt: "Eine gelbe Banane"
- [ ] L24 `public/images/vocabulary/miftah.svg` — der Schlüssel (مِفْتَاح) — alt: "Ein Schlüssel"
- [ ] L24 `public/images/vocabulary/mizalla.svg` — der Regenschirm (مِظَلَّة) — alt: "Ein Regenschirm im Regen"
- [ ] L25 `public/images/vocabulary/namir.svg` — der Tiger (نَمِر) — alt: "Ein Tiger"
- [ ] L25 `public/images/vocabulary/nahla.svg` — die Biene (نَحْلَة) — alt: "Eine Biene"
- [ ] L25 `public/images/vocabulary/najma.svg` — der Stern (نَجْمَة) — alt: "Ein gelber Stern"
- [ ] L26 `public/images/vocabulary/hilal.svg` — der Halbmond (هِلَال) — alt: "Eine Mondsichel am Nachthimmel"
- [ ] L26 `public/images/vocabulary/hatif.svg` — das Telefon (هَاتِف) — alt: "Ein Telefon"
- [ ] L26 `public/images/vocabulary/haram.svg` — die Pyramide (هَرَم) — alt: "Eine Pyramide in der Wüste"
- [ ] L27 `public/images/vocabulary/warda.svg` — die Rose (وَرْدَة) — alt: "Eine rote Rose"
- [ ] L27 `public/images/vocabulary/walad.svg` — der Junge (وَلَد) — alt: "Ein Junge"
- [ ] L27 `public/images/vocabulary/wisada.svg` — das Kissen (وِسَادَة) — alt: "Ein Kissen"
- [ ] L28 `public/images/vocabulary/yad.svg` — die Hand (يَد) — alt: "Eine offene Hand"
- [ ] L28 `public/images/vocabulary/yaqtin.svg` — der Kürbis (يَقْطِين) — alt: "Ein orangefarbener Kürbis"
- [ ] L28 `public/images/vocabulary/yamama.svg` — die Taube (يَمَامَة) — alt: "Eine Taube"

## 4. Points that especially need a decision

- [ ] Transliteration scheme: German-friendly (dsch, ch, sch, j for ي, ai/au for diphthongs; ḥ ṣ ḍ ṭ ẓ ʿ ʾ q gh th dh z kept). See DECISIONS.md.
- [ ] Collective nouns: singular forms were chosen where common (تُفَّاحَة, رُمَّانَة, زَيْتُونَة, لَيْمُونَة, مَوْزَة); عِنَب is taught as "die Weintrauben".
- [ ] ج: soundHint mentions the Egyptian hard "g" – keep or remove?
- [ ] ض: ضَبُع (hyena) and ضِرْس (molar) are less common words – ض has very few simple, drawable nouns.
- [ ] ظ: ظَبْي (gazelle), ظُفْر (fingernail), ظَرْف (envelope) – same reason.
- [ ] لَقْلَق (stork) is not very common; alternative: لَحْم (meat), لُعْبَة (toy).
- [ ] Emphatic and pharyngeal sound descriptions (ح ع ص ض ط ظ ق غ خ).
