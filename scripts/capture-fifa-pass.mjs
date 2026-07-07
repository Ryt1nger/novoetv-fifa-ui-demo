#!/usr/bin/env node
/**
 * FIFA 2026 screenshot pass via adb.
 * Prerequisite: app logged in, main menu visible (or already in sport section).
 */
import { execSync, spawnSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'screenshots', 'scan');
const adb = process.env.ADB || join(process.env.HOME, 'Library/Android/sdk/platform-tools/adb');

const KEY = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  CENTER: 23,
  BACK: 4,
};

mkdirSync(outDir, { recursive: true });

function adbShell(cmd) {
  return execSync(`"${adb}" shell ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function waitDevice(maxSec = 300) {
  console.log('Waiting for adb device (up to', maxSec, 's)...');
  for (let i = 0; i < maxSec; i += 2) {
    try {
      const devices = execSync(`"${adb}" devices`, { encoding: 'utf8' });
      if (/^\S+\s+device$/m.test(devices.replace('List of devices attached\n', ''))) {
        const boot = adbShell('getprop sys.boot_completed');
        if (boot === '1') {
          console.log('Device ready.');
          return;
        }
      }
    } catch { /* retry */ }
    if (i % 10 === 0 && i > 0) console.log(`  still waiting... ${i}s`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
  }
  throw new Error('No adb device within timeout');
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function key(code, delayMs = 500) {
  adbShell(`input keyevent ${code}`);
  sleep(delayMs);
}

function shot(name) {
  const path = join(outDir, name);
  const buf = spawnSync(adb, ['exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
  if (buf.status !== 0 || !buf.stdout?.length) throw new Error(`screencap failed: ${name}`);
  writeFileSync(path, buf.stdout);
  console.log('saved', name);
}

function dumpUi() {
  adbShell('uiautomator dump /sdcard/fifa_ui.xml');
  return adbShell('cat /sdcard/fifa_ui.xml');
}

function uiContains(text) {
  try {
    const xml = dumpUi();
    return xml.includes(text);
  } catch {
    return false;
  }
}

function pressUntil(findText, keyCode, max = 25) {
  for (let i = 0; i < max; i++) {
    if (uiContains(findText)) return true;
    key(keyCode, 400);
  }
  return uiContains(findText);
}

// --- pass ---
waitDevice();

console.log('Pause 5s — finish login / open main menu if needed...');
sleep(5000);

shot('00-baseline.png');

// Try to focus FIFA menu item
console.log('Navigating to ЧМ FIFA 2026...');
if (!pressUntil('ЧМ FIFA', KEY.DOWN) && !pressUntil('FIFA', KEY.DOWN)) {
  console.warn('Could not find FIFA in UI dump — saving current screen as 00-menu-fifa-focused.png');
}
shot('00-menu-fifa-focused.png');

key(KEY.CENTER, 1200);
shot('01-sport-entry.png');

// Rail / tabs exploration
key(KEY.RIGHT, 800);
shot('02-sport-schedule-content.png');

key(KEY.DOWN, 400);
key(KEY.DOWN, 400);
shot('03-sport-schedule-scrolled.png');

// Tab bracket via rail down
key(KEY.LEFT, 600);
key(KEY.DOWN, 500);
key(KEY.CENTER, 800);
key(KEY.RIGHT, 800);
shot('07-bracket-default.png');

key(KEY.DOWN, 500);
key(KEY.CENTER, 800);
key(KEY.RIGHT, 800);
shot('09-my-team-countries.png');

console.log('Pass complete. Review', outDir);
