#!/usr/bin/env bash
# Simulates a publisher clone: no local `.env`, only committed keys.
# Builds an unsigned Release archive and checks main.jsbundle for Supabase.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ARCHIVE_PATH="${ROOT}/dist-ios/TrackIt-publisher-check.xcarchive"
LOG_PATH="${ROOT}/dist-ios/publisher-check.log"
HIDE_ENV=0

cleanup() {
  if [[ "$HIDE_ENV" -eq 1 && -f "${ROOT}/.env.__publisher_check_bak" ]]; then
    mv "${ROOT}/.env.__publisher_check_bak" "${ROOT}/.env"
    echo "Restored .env"
  fi
}
trap cleanup EXIT

mkdir -p dist-ios

if [[ -f .env ]]; then
  mv .env .env.__publisher_check_bak
  HIDE_ENV=1
  echo "Hid local .env for this test (publisher does not have it)."
fi

# Clear any exported keys from the current shell / CI env.
unset EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY || true

if [[ ! -f .env.production ]]; then
  echo "FAIL: .env.production missing — publisher would not get public keys from git."
  exit 1
fi

echo "Building Release archive WITHOUT local .env..."
echo "(Does not export EXPO_PUBLIC_* in this shell — only .env.production via ios/.xcode.env + code defaults.)"
rm -rf "$ARCHIVE_PATH"

xcodebuild \
  -workspace ios/TrackIt.xcworkspace \
  -scheme TrackIt \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="" \
  archive \
  >"$LOG_PATH" 2>&1

BUNDLE="$(find "$ARCHIVE_PATH/Products" -name 'main.jsbundle' | head -1)"
if [[ -z "$BUNDLE" || ! -f "$BUNDLE" ]]; then
  echo "FAIL: main.jsbundle not found. See $LOG_PATH"
  exit 1
fi

URL_HIT="$(grep -c 'vvdakzkcfnmczddukgtg.supabase.co' "$BUNDLE" || true)"
KEY_HIT="$(grep -c 'UNcQpNbgTER-PTfqnXRimfqM4IYYw7wzgZzdvEwFij0' "$BUNDLE" || true)"
PLACEHOLDER_HIT="$(grep -c 'placeholder.supabase.co' "$BUNDLE" || true)"

echo ""
echo "=== Publisher simulation result ==="
echo "main.jsbundle: $BUNDLE"
echo "supabase URL in bundle: $URL_HIT"
echo "anon key fragment in bundle: $KEY_HIT"
echo "placeholder URL in bundle: $PLACEHOLDER_HIT"

if [[ "$URL_HIT" -ge 1 && "$KEY_HIT" -ge 1 ]]; then
  echo "PASS: Supabase keys are embedded without local .env — publisher Archive will work."
  exit 0
fi

echo "FAIL: keys missing from bundle. Publisher would still see the error."
echo "Log: $LOG_PATH"
exit 1
