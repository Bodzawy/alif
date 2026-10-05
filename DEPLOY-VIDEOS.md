# Intro videos in production

Intro videos are **not in git** (`public/videos/**/*.mp4` is in `.gitignore`). Only the small posters are.
The URLs are the same everywhere: `/videos/a1/lesson-N/de.mp4` and `/videos/a1/lesson-N/poster.jpg`.

| Where | Who serves `/videos/…` | Files |
|---|---|---|
| Dev (`npm run dev`) | Next.js, from `public/videos/` | your local copies |
| Production | **nginx**, from `/var/www/alif-videos/` | uploaded with `scripts/upload-videos.sh` |

Next.js would also serve `/videos/` from `public/`. Once the nginx block below is active, nginx answers every
`/videos/` request itself and Next.js never sees it. Deploys therefore never build, copy or move video files.

> **Order matters for the first rollout.** Alif's video (`public/videos/a1/lesson-1/de.mp4`) was removed from git
> in this change. The next `git checkout` on the server deletes it from `/opt/alif/public/`. Upload the videos and
> switch nginx (steps 1–3) **before** deploying the app (step 4), otherwise Alif's intro is briefly a 404.

## 1. Create the video folder on the server

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144 \
  'mkdir -p /var/www/alif-videos && chmod 755 /var/www/alif-videos'
```

## 2. Upload the videos (from your Mac, in the repo)

```bash
scripts/upload-videos.sh --dry-run   # shows what would be sent
scripts/upload-videos.sh             # sends only new or changed files
```

The script runs `rsync -avz --progress --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r` (= F644,D755; the macOS rsync does not
accept the octal form) from `public/videos/` to `root@169.58.55.144:/var/www/alif-videos/` with
`~/.ssh/id_ed25519_alif_vps`. It sends the `.mp4` files **and the `poster.jpg` files**: nginx answers every
`/videos/` URL from that folder, so the posters must be there too. It never deletes anything on the server.

## 3. nginx: serve `/videos/` directly

In `/etc/nginx/sites-available/alif`, in the `server { listen 443 ssl http2; … }` block, add this **before**
`location /api/ { … }` and `location / { … }`:

```nginx
    location /videos/ {
        alias /var/www/alif-videos/;
        add_header Cache-Control "public, max-age=2592000";
        # add_header in a location replaces the server-level add_header lines, so HSTS is repeated here.
        add_header Strict-Transport-Security "max-age=31536000" always;
        access_log off;
    }
```

Then:

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144
cp /etc/nginx/sites-available/alif /root/alif.nginx.bak-$(date +%F)
nano /etc/nginx/sites-available/alif        # paste the block above
nginx -t && systemctl reload nginx
```

Check (from anywhere):

```bash
curl -sI https://alif.169-58-55-144.nip.io/videos/a1/lesson-2/de.mp4 | grep -iE "HTTP|content-type|cache-control|x-nextjs"
#   HTTP/2 200, content-type: video/mp4, cache-control: public, max-age=2592000, and NO x-nextjs-* header
curl -s -o /dev/null -w "%{http_code}\n" -r 0-1023 https://alif.169-58-55-144.nip.io/videos/a1/lesson-2/de.mp4   # 206
curl -s -o /dev/null -w "%{http_code}\n" https://alif.169-58-55-144.nip.io/videos/a1/lesson-2/poster.jpg        # 200
```

Rollback: `cp /root/alif.nginx.bak-<date> /etc/nginx/sites-available/alif && nginx -t && systemctl reload nginx`.

## 4. Deploy the app (as before)

```bash
ssh -i ~/.ssh/id_ed25519_alif_vps root@169.58.55.144
cd /opt/alif
git fetch origin
git checkout --detach <commit>      # the commit you pushed
npm ci
npm run build
pm2 restart alif
```

## Replacing a video later (cache busting)

nginx tells browsers to keep videos (and posters) for 30 days. Replacing a file under the **same name** means many
students keep seeing the old one. Use a new name instead:

1. Save the new file as e.g. `public/videos/a1/lesson-2/de-v2.mp4` (or `poster-v2.jpg`).
2. Change `introVideo.src` (or `poster`) in `src/data/lessons/a1/lesson-2.ts`.
3. `scripts/upload-videos.sh`, then deploy the app (step 4).
4. Optionally delete the old file on the server once the new version is live.

`npm run lessons:status` and `npm test` check that every referenced video exists locally (skipped in CI, where
the mp4 files are not available; posters are always checked).

## Compressing a new video

```bash
ffmpeg -i in.mp4 -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart de.mp4          # skip the scale filter if the source is ≤ 720p
ffmpeg -ss 3 -i in.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 4 poster.jpg
```

Aim for roughly 5–15 MB per 2 minutes; above 20 MB use `-crf 28`.
