#!/usr/bin/env bash
# Manual Expo Go 56 install for iOS Simulator (bypasses flaky Expo CLI CDN downloads).
# Usage: ./scripts/install-expo-go-simulator.sh

set -euo pipefail

EXPO_GO_VERSION="56.0.3"
URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-${EXPO_GO_VERSION}/Expo-Go-${EXPO_GO_VERSION}.tar.gz"
CACHE_DIR="${HOME}/.expo/ios-simulator-app-cache"
ARCHIVE="${CACHE_DIR}/Expo-Go-${EXPO_GO_VERSION}.tar.gz"

mkdir -p "$CACHE_DIR"

echo "→ Downloading Expo Go ${EXPO_GO_VERSION} from GitHub..."
curl -fL --retry 5 --retry-delay 3 -o "$ARCHIVE" "$URL"

echo "→ Extracting..."
tar -xzf "$ARCHIVE" -C "$CACHE_DIR"

APP_PATH="$(find "$CACHE_DIR" -maxdepth 3 -name '*.app' -type d | head -1)"
if [[ -z "$APP_PATH" ]]; then
  echo "ERROR: Could not find .app inside archive."
  exit 1
fi

echo "→ Found: $APP_PATH"

if ! xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
  echo "→ No simulator booted. Opening Simulator..."
  open -a Simulator
  sleep 3
fi

echo "→ Installing on booted simulator..."
xcrun simctl install booted "$APP_PATH"

echo "✓ Expo Go ${EXPO_GO_VERSION} installed. Run: npm start → press i"
