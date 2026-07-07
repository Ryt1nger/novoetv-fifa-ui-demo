#!/usr/bin/env node
/** Download api-sports team flags for all team_id used in mocks/. */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mocksDir = join(root, 'mocks');
const outDir = join(root, 'assets', 'img', 'flags');
const manifestPath = join(outDir, 'manifest.json');
const API = 'https://media.api-sports.io/football/teams';

mkdirSync(outDir, { recursive: true });

const ids = new Set();
for (const file of readdirSync(mocksDir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(mocksDir, file), 'utf8'));
  const matches = data.matches || {};
  Object.values(matches).forEach((m) => {
    if (m.team1_id > 0) ids.add(m.team1_id);
    if (m.team2_id > 0) ids.add(m.team2_id);
  });
  const teams = data.teams || {};
  Object.values(teams).forEach((t) => {
    if (t.id > 0) ids.add(t.id);
  });
}

const sorted = [...ids].sort((a, b) => a - b);
let ok = 0;
let fail = 0;

for (const id of sorted) {
  const dest = join(outDir, `${id}.png`);
  if (existsSync(dest)) {
    ok++;
    continue;
  }
  try {
    const res = await fetch(`${API}/${id}.png`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    ok++;
    process.stdout.write(`ok ${id}\n`);
  } catch (e) {
    fail++;
    process.stderr.write(`fail ${id}: ${e.message}\n`);
  }
}

writeFileSync(manifestPath, JSON.stringify({ ids: sorted, ok, fail }, null, 2));
console.log(`\nFlags: ${ok} cached, ${fail} failed → ${outDir}`);
