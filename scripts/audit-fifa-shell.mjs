import { createRequire } from 'module';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(__dir, '../ui/js/fifa-data.js'));
const { chromium } = require(join(__dir, '../../player-reference/node_modules/playwright'));
const root = join(__dir, '..');
const outDir = join(root, 'screenshots', 'audit');
mkdirSync(outDir, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

function serve(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = req.url.split('?')[0];
      if (path === '/') path = '/ui/1920/index.html';
      const file = join(root, path.replace(/^\//, ''));
      try {
        const data = readFileSync(file);
        const ext = file.slice(file.lastIndexOf('.'));
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(port, () => resolve(server));
  });
}

const STATES = [
  { name: '01-tab-schedule-focused', preset: 'tab-schedule-focused' },
  { name: '02-rail-schedule-focused', preset: 'rail-schedule-focused' },
  { name: '03-tab-bracket-focused', preset: 'tab-bracket-focused' },
  { name: '04-rail-bracket-focused', preset: 'rail-bracket-focused' },
  { name: '05-tab-my-team-focused', preset: 'tab-my-team-focused' },
  { name: '06-rail-my-team-focused', preset: 'rail-my-team-focused' }
];

const port = 8778;
const server = await serve(port);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto(`http://127.0.0.1:${port}/ui/1920/index.html?audit=1`, { waitUntil: 'load' });
await page.waitForFunction(() => typeof SportUI !== 'undefined' && typeof AppPreview !== 'undefined');
await page.waitForFunction(() => document.getElementById('dev-status')?.textContent?.includes('матчей'));
await page.waitForTimeout(400);

for (const state of STATES) {
  await page.evaluate((preset) => AppPreview.applyAuditPreset(preset), state.preset);
  await page.waitForTimeout(300);
  await page.locator('#tv-stage').screenshot({ path: join(outDir, `${state.name}.png`) });
  console.log('saved', state.name);
}

await browser.close();
server.close();
console.log('Audit screenshots:', outDir);
