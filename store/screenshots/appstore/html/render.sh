#!/usr/bin/env bash
# Render all App Store banner HTML pages to 1320x2868 PNGs.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/.."
SHELL_BIN="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell"

for f in "$DIR"/0*.html; do
  name="$(basename "$f" .html)"
  "$SHELL_BIN" --disable-gpu --hide-scrollbars \
    --screenshot="$OUT/$name.png" \
    --window-size=1320,2868 \
    --force-device-scale-factor=1 \
    --virtual-time-budget=4000 \
    "file://$f" 2>/dev/null
  echo "rendered $name.png"
done
