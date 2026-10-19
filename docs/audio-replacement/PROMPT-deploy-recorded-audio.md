اشتغل في ~/Desktop/alif. الهدف: نشر تسجيلات ElevenLabs العربية (الحروف والكلمات) على الموقع. الشغل اتجهّز بالفعل، وأنت هتتحقق منه وتنشره بحذر. اقرأ DEPLOY-AUDIO.md الأول، هو المرجع.

اللي اتعمل:
- src/lib/tts/player.ts: لو النص في src/lib/tts/recorded-manifest.json بيشغّل /audio/ar/<id>.<hash>.mp3. لو مفيش، أو الملف مش موجود، أو صوت حوار، بيرجع لـ/api/tts (Azure).
- src/lib/tts/recorded-manifest.json (في git، فيه 300 نص حاليًا) + public/audio/ar/*.mp3 (مش في git، في .gitignore).
- tests/unit/recorded-audio.test.ts، scripts/upload-audio.sh، DEPLOY-AUDIO.md، scripts/audio/*، docs/audio-replacement/، وتعديل .gitignore.

الخطوات بالترتيب:
1. شغّل python3 scripts/audio/install_clips.py عشان كل الدفعات الجاهزة في docs/audio-replacement/audio-out/batch-* تتركّب. اقرأ docs/audio-replacement/rejected.txt لو موجود (ids المرفوضة بتتستثنى). اطبعلي عدد النصوص في الـmanifest.
2. npm run check. لو فيه فشل مش بسبب التغييرات دي قولي من غير ما تصلحه. تأكد إن tests/unit/recorded-audio.test.ts بيعدي.
3. تحقق محليًا بـnpm run dev: افتح درس فيه حروف وكلمات، وتأكد في الـNetwork إن النصوص اللي ليها تسجيل بتروح لـ/audio/ar/…mp3 (200) مش /api/tts، وإن نص من غير تسجيل لسه بيروح لـ/api/tts.
4. اعمل commit للملفات اللي فوق بس. متضيفش ملفات الـIQRA: docs/iqra-reliability.md و scripts/analyse-iqra.ts و scripts/iqra-phonemes.ts و scripts/measure-iqra.ts و results/. افحص git status و git diff --stat قبل الـcommit.
5. اسألني قبل أي لمس للسيرفر. بعد موافقتي:
   a. أنشئ /var/www/alif-audio/ar على السيرفر، ثم scripts/upload-audio.sh --dry-run، ثم scripts/upload-audio.sh.
   b. أضف location /audio/ar/ { … } في nginx (الكتلة موجودة في DEPLOY-AUDIO.md) قبل location /api/ و location /. خد نسخة احتياطية الأول، وشغّل nginx -t قبل الـreload، وماتلمسش أي location تاني. /audio/a1/ لازم يفضل عند Next.js.
   c. اختبر بـcurl -sI https://alif.169-58-55-144.nip.io/audio/ar/<ملف حقيقي>.mp3: لازم 200 و content-type: audio/mpeg وبدون هيدر x-nextjs-*.
   d. انشر الكود بالطريقة المعتادة (checkout على الـcommit، npm ci، npm run build، pm2 restart alif).
6. تحقق على الموقع الحي: افتح درس وسمّع كلمة وحرف وراقب الـNetwork. لو فيه مشكلة، رجّع nginx من النسخة الاحتياطية (الكود بيرجع لـAzure لوحده).

ملاحظات:
- الحوارات والجمل لسه Azure عمدًا، ده الجزء الجاي.
- متعدّلش /api/tts ولا ALLOWED_TTS_TEXTS ولا قواعد التنوين أو الـlong-vowel.
- لو نص اتغيّر في الكود (تشكيل أو تنوين) بعد التسجيل، مش هيطابق الـmanifest وهيتنطق من Azure. قولي لو لقيت نصوص كده، من غير ما تغيّر حاجة.
