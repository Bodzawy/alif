#!/usr/bin/env bash
# Uploads the recorded Arabic clips from public/audio/ar/ to the server, where nginx
# serves them under /audio/ar/ (see DEPLOY-AUDIO.md). rsync only sends new or changed
# files; nothing is ever deleted on the server (old versions stay, so a page that is
# still open in a browser keeps working).
#
#   scripts/upload-audio.sh             # upload
#   scripts/upload-audio.sh --dry-run   # only show what would be sent
set -euo pipefail

cd "$(dirname "$0")/.."

SERVER="${ALIF_VIDEO_SERVER:-root@169.58.55.144}"
TARGET="${ALIF_AUDIO_DIR:-/var/www/alif-audio/ar/}"
KEY="${ALIF_SSH_KEY:-$HOME/.ssh/id_ed25519_alif_vps}"

rsync -avz --progress --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  --include='*.mp3' --exclude='*' \
  -e "ssh -i $KEY -o IdentitiesOnly=yes" \
  "$@" \
  public/audio/ar/ "$SERVER:$TARGET"
