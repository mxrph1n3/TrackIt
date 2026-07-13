#!/usr/bin/env bash
# Capture App Store / Play screenshots from iOS Simulator + Android emulator.
# Usage: with Expo Go or production build open on the target screen, then:
#   bash scripts/capture-store-screenshots.sh ios
#   bash scripts/capture-store-screenshots.sh android

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/store/screenshots"
mkdir -p "$OUT"
STAMP="$(date +%Y%m%d-%H%M%S)"
PLATFORM="${1:-ios}"

case "$PLATFORM" in
  ios)
    FILE="$OUT/ios-$STAMP.png"
    xcrun simctl io booted screenshot "$FILE"
    echo "Saved $FILE"
    sips -g pixelWidth -g pixelHeight "$FILE" 2>/dev/null || true
    echo "Tip: App Store wants 1290×2796 (6.7\"). Resize if needed in Preview or:"
    echo "  sips -z 2796 1290 \"$FILE\" --out \"$OUT/ios-6.7-$STAMP.png\""
    ;;
  android)
    FILE="$OUT/android-$STAMP.png"
    adb exec-out screencap -p > "$FILE"
    echo "Saved $FILE"
    ;;
  *)
    echo "Usage: $0 ios|android"
    exit 1
    ;;
esac
