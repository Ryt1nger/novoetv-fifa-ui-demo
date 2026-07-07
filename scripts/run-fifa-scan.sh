#!/usr/bin/env bash
# Safe FIFA scan — NO OK on match cards (player risk). Dialog shot skipped unless safe.
set -euo pipefail
ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
OUT="/Users/a1111/tv-samsung/fifa-reference/screenshots/scan"
mkdir -p "$OUT"

K_UP=19 K_DOWN=20 K_LEFT=21 K_RIGHT=22 K_CENTER=23 K_BACK=4

shot() { "$ADB" exec-out screencap -p > "$OUT/$1" && echo "✓ $1"; }
key() { "$ADB" shell input keyevent "$1"; sleep "${2:-0.6}"; }
tap() { "$ADB" shell input tap "$1" "$2"; sleep "${2:-0.6}" 2>/dev/null || { "$ADB" shell input tap "$1" "$2"; sleep 0.6; }; }

# tap rail button by content-desc via bounds from dump
tap_rail() {
  local desc="$1"
  "$ADB" shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
  local xml="$("$ADB" shell cat /sdcard/ui.xml)"
  python3 - "$desc" <<'PY'
import re, sys
desc = sys.argv[1]
xml = open('/dev/stdin').read() if False else sys.stdin.read()
PY
}

echo "=== FIFA scan start ==="
shot "01-sport-schedule-tab-focused.png"

# Focus rail schedule (tap center of rail schedule button ~56,496)
key $K_LEFT
key $K_LEFT
shot "02-rail-schedule-focused.png"

# Enter schedule content
key $K_RIGHT
key $K_DOWN
shot "03-schedule-match-focused.png"

# Scroll down in schedule (no OK)
for _ in 1 2 3 4 5 6; do key $K_DOWN 0.35; done
shot "04-schedule-scrolled.png"

# Scroll top if visible — try UP many times then look
for _ in 1 2 3 4 5 6 7 8; do key $K_UP 0.35; done
key $K_UP
shot "05-schedule-top-area.png"

# Bracket via rail
key $K_LEFT
key $K_DOWN
shot "06-rail-bracket-focused.png"
key $K_RIGHT
sleep 0.8
shot "07-bracket-default.png"

# Move in bracket grid (no OK)
key $K_RIGHT; key $K_DOWN; key $K_DOWN
shot "08-bracket-cell-focused.png"

# My team
key $K_LEFT
key $K_DOWN
shot "09-rail-myteam-focused.png"
key $K_RIGHT
sleep 0.8
shot "10-my-team-default.png"

key $K_RIGHT
shot "11-my-team-schedule-side.png"

key $K_LEFT
key $K_UP
shot "12-my-team-country-focused.png"

# Tabs: bracket tab via UP from content
key $K_UP
key $K_UP
key $K_RIGHT
shot "13-tab-bracket-focused.png"
key $K_RIGHT
shot "14-tab-myteam-focused.png"
key $K_LEFT
key $K_LEFT
shot "15-tab-schedule-focused.png"

# Exit to menu
key $K_LEFT
key $K_LEFT
key $K_BACK
sleep 0.8
shot "16-menu-after-back.png"

# Try find FIFA in menu
for _ in $(seq 1 12); do
  if "$ADB" shell cat /sdcard/ui.xml 2>/dev/null | grep -q "ЧМ FIFA"; then break; fi
  "$ADB" shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
  if "$ADB" shell cat /sdcard/ui.xml | grep -q "ЧМ FIFA"; then break; fi
  key $K_DOWN 0.4
done
shot "00-menu-fifa-focused.png"

echo "=== FIFA scan done ==="
ls -la "$OUT"/*.png | grep -v _wait_
