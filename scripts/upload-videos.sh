#!/usr/bin/env bash
# Uploads the intro videos (and their posters) from public/videos/ to the
# server, where nginx serves them under /videos/ (see DEPLOY-VIDEOS.md).
# rsync only sends files that changed; nothing is ever deleted on the server.
# --chmod is F644,D755 written symbolically, because the rsync that ships with
# macOS (openrsync) does not accept the octal form.
#
#   scripts/upload-videos.sh             # upload
#   scripts/upload-videos.sh --dry-run   # only show what would be sent
#
# Posters are included because nginx answers every /videos/ URL from
# /var/www/alif-videos/, so they must be there as well.
set -euo pipefail

cd "$(dirname "$0")/.."

SERVER="${ALIF_VIDEO_SERVER:-root@169.58.55.144}"
TARGET="${ALIF_VIDEO_DIR:-/var/www/alif-videos/}"
KEY="${ALIF_SSH_KEY:-$HOME/.ssh/id_ed25519_alif_vps}"

rsync -avz --progress --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  --include='*/' --include='*.mp4' --include='poster.jpg' --exclude='*' \
  -e "ssh -i $KEY -o IdentitiesOnly=yes" \
  "$@" \
  public/videos/ "$SERVER:$TARGET"
