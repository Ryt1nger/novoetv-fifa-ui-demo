#!/usr/bin/env bash
# Capture FIFA 2026 section screenshots via adb.
# Usage: ./capture-fifa-screens.sh [output_dir]
set -euo pipefail

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
OUT="${1:-$(cd "$(dirname "$0")/.." && pwd)/screenshots/scan}"
mkdir -p "$OUT"

die() { echo "ERROR: $*" >&2; exit 1; }

wait_device() {
  echo "Waiting for adb device..."
  "$ADB" wait-for-device
  for i in $(seq 1 60); do
    if "$ADB" shell getprop sys.boot_completed 2>/dev/null | grep -q 1; then
      echo "Device ready."
      return 0
    fi
    sleep 2
  done
  die "Device did not finish booting"
}

shot() {
  local name="$1"
  local path="$OUT/$name"
  "$ADB" exec-out screencap -p > "$path"
  echo "saved $path"
}

key() {
  "$ADB" shell input keyevent "$1"
  sleep "${2:-0.45}"
}

# --- main ---
wait_device

echo "Output: $OUT"
echo "Taking control in 3s (switch to app if needed)..."
sleep 3

shot "00-current-screen.png"

echo "Done manual checkpoint 00. Run navigation from host script or capture more manually."
