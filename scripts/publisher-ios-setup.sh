#!/usr/bin/env bash
# Fresh clone → ready for Xcode Archive (no Expo / EAS required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js 20+ required (node -v)."
  exit 1
fi

if ! command -v pod >/dev/null 2>&1; then
  echo "ERROR: CocoaPods required. Install: brew install cocoapods"
  exit 1
fi

echo "==> npm install"
npm install

echo "==> pod install"
cd ios
pod install
cd ..

echo ""
echo "OK. Open ONLY the workspace (not .xcodeproj):"
echo "  open ios/TrackIt.xcworkspace"
echo ""
echo "Then in Xcode: Team → Product → Archive (Any iOS Device)."
echo "Do NOT Product → Run for App Store."

if [[ "${OPEN_XCODE:-1}" == "1" ]]; then
  open ios/TrackIt.xcworkspace
fi
