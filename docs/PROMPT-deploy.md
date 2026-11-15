انشر commit 9d20a33 على السيرفر. ده التعديل اللي خلّى أُ يقبل `u|uu|U|UU|o|oo|oh|<` في البيجينير.

1. `git push origin claude/epic-feynman-kf9egu`
2. `ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144`، وبعدين:
   `cd /opt/alif && git fetch origin && git checkout --detach 9d20a33 && npm ci && npm run build && pm2 restart alif`
3. اتأكد إن https://alif.169-58-55-144.nip.io/a1 بيرجع 200، وإن `pm2 logs alif --lines 30 --nostream` مفيهوش errors.

متلمسش أي حاجة تانية على السيرفر، ومتطبعش أي secrets.
