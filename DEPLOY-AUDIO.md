# Recorded Arabic audio in production

The Arabic letters and words are played from professional ElevenLabs recordings, not from Azure. The clips are
**not in git** (`public/audio/ar/` is in `.gitignore`). The small list that says which text has which clip,
`src/lib/tts/recorded-manifest.json`, **is** in git.

| Where | Who serves `/audio/ar/…` | Files |
|---|---|---|
| Dev (`npm run dev`) | Next.js, from `public/audio/ar/` | your local copies |
| Production | **nginx**, from `/var/www/alif-audio/ar/` | uploaded with `scripts/upload-audio.sh` |

Only `/audio/ar/` goes to nginx. Next.js keeps serving everything else under `/audio/` (e.g. `/audio/a1/…`).

How the player decides (`src/lib/tts/player.ts`): text in the manifest → fetch `/audio/ar/<id>.<hash>.mp3`;
text not in the manifest, a dialogue voice, or a clip that cannot be loaded → `/api/tts` (Azure) as before.
So a missing upload never breaks a lesson, it only falls back to the old voice.

## Making new clips

1. `npx vite-node -c vitest.config.mts scripts/audio/batches-from-code.ts` makes the batches from the code: every
   text the app speaks that has no recording yet (`batches/batch-04` …, 100 each; 01–03 are recorded), and
   `batch-rerecord` for recordings whose text the app no longer speaks (they are taken out of the manifest and
   listed in `rejected.txt`). It keeps every id; a new text gets the next free one.
2. Record a batch with one voice for all (Google AI Studio: `docs/audio-replacement/STYLE-gemini.md`), save the
   audio as `docs/audio-replacement/audio-in/batch-NN.mp3`.
3. `cd docs/audio-replacement && python3 ../../scripts/audio/split_batch.py batches/batch-NN.json audio-in/batch-NN.mp3`
   cuts it and writes `audio-out/batch-NN/` with a `review.html` to listen to every clip. Clips flagged there need a careful listen.
4. Bad clips: put their ids (e.g. `w0123`) into `docs/audio-replacement/rejected.txt` (one per line) and re-record only those.
5. `python3 scripts/audio/install_clips.py` copies the approved clips to `public/audio/ar/<id>.<hash>.mp3` (the hash is
   part of the name, so a re-recorded clip gets a new URL and no browser cache is stale) and rewrites the manifest.

## Rollout (first time, and after every new set of clips)

> **Order:** upload the clips (step 1) before you deploy the manifest (step 3). The other way round is not harmful
> (the player falls back to Azure for clips that are not there yet) but students would hear the old voice.

### 1. Create the folder and upload (from your Mac, in the repo)

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144 \
  'mkdir -p /var/www/alif-audio/ar && chmod -R 755 /var/www/alif-audio'
scripts/upload-audio.sh --dry-run
scripts/upload-audio.sh
```

### 2. nginx: serve `/audio/ar/` directly (once)

In `/etc/nginx/sites-available/alif`, in the `server { listen 443 ssl http2; … }` block, **before**
`location /api/ { … }` and `location / { … }`:

```nginx
    location /audio/ar/ {
        alias /var/www/alif-audio/ar/;
        # file names contain a content hash, so a file never changes under the same URL
        add_header Cache-Control "public, max-age=31536000, immutable";
        # add_header in a location replaces the server-level add_header lines, so HSTS is repeated here.
        add_header Strict-Transport-Security "max-age=31536000" always;
        access_log off;
    }
```

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144
cp /etc/nginx/sites-available/alif /root/alif.nginx.bak-$(date +%F)
nano /etc/nginx/sites-available/alif
nginx -t && systemctl reload nginx
```

Check (use a real file name from `ls public/audio/ar | head -1`):

```bash
curl -sI https://alif.169-58-55-144.nip.io/audio/ar/w0001.XXXXXXXX.mp3 | grep -iE "HTTP|content-type|cache-control|x-nextjs"
#   HTTP/2 200, content-type: audio/mpeg, cache-control: …immutable, and NO x-nextjs-* header
```

Rollback: `cp /root/alif.nginx.bak-<date> /etc/nginx/sites-available/alif && nginx -t && systemctl reload nginx`.

### 3. Deploy the app (as before)

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144
cd /opt/alif
git fetch origin
git checkout --detach <commit>
npm ci
npm run build
pm2 restart alif
```

## What is not covered yet

Dialogues and sentences (multi-word texts, four dialogue voices) still come from Azure.
