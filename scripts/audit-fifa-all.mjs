import { createRequire } from 'module';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { spawnSync } from 'child_process';

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

/** Audit states — mapped to actual scan PNG content (filenames may mislabel focus target). */
const STATES = [
  { name: '01-tab-schedule-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'schedule' });
    var pid = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ clearFocus: true, scrollToMatchId: pid, showScrollTop: true });
  }},
  { name: '02-rail-schedule-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: 'schedule', tabFocus: null });
    var pid = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ clearFocus: true, scrollToMatchId: pid, showScrollTop: true });
  }},
  { name: '02-schedule-from-top', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
    const id = ScheduleUI.findFirstMatchOnDate('26.06') || ScheduleUI.getFirstMatchId();
    ScheduleUI.applyAuditState({ clearFocus: true, scrollToMatchId: id });
  }},
  { name: '03-schedule-match-focus-top', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
    const id = ScheduleUI.findFirstMatchOnDate('26.06') || ScheduleUI.getFirstMatchId();
    ScheduleUI.applyAuditState({ matchId: id, selectedMatchId: id, scrollToMatchId: id });
  }},
  { name: '04-schedule-scrolled-mid', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
    const id = ScheduleUI.findMatchId('PLAYOFF_10') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ matchId: id, selectedMatchId: id, scrollToMatchId: id, showScrollTop: true });
  }},
  { name: '05-schedule-scroll-top-area', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
    var pid = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ matchId: pid, selectedMatchId: pid, scrollToMatchId: pid, showScrollTop: true });
    BroadcastUI.applyAuditState({ showBroadcastDialog: true, focusedIndex: 1 });
  }},
  { name: '06-rail-bracket-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: 'bracket', tabFocus: null });
    var pid = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ clearFocus: true, scrollToMatchId: pid, showScrollTop: true });
  }},
  { name: '07-bracket-default', fn: () => {
    AppPreview.applyShellState({ activeTab: 'bracket', railFocus: null, tabFocus: null });
    BracketUI.applyAuditState({ focusedCellId: 'left_r0_0' });
  }},
  { name: '08-bracket-playable-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'schedule' });
    const id = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ matchId: id, selectedMatchId: id, scrollToMatchId: id, showScrollTop: true });
    BroadcastUI.applyAuditState({ showBroadcastDialog: true, focusedIndex: 1 });
  }},
  { name: '13-tab-bracket-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'bracket' });
    const id = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ matchId: id, selectedMatchId: id, scrollToMatchId: id, showScrollTop: true });
    BroadcastUI.applyAuditState({ showBroadcastDialog: true, focusedIndex: 1 });
  }},
  { name: '15-broadcast-sources-dialog', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
    BroadcastUI.applyAuditState({ showBroadcastDialog: true });
  }},
  { name: '09-rail-myteam-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'bracket', railFocus: 'my_team', tabFocus: null });
    BracketUI.applyAuditState({ focusedCellId: null });
  }},
  { name: '10-my-team-countries', fn: () => {
    AppPreview.applyMyTeamAudit('my-team-countries');
  }},
  { name: '11-my-team-schedule-filtered', fn: () => {
    AppPreview.applyMyTeamAudit('my-team-schedule-filtered');
  }},
  { name: '12-my-team-country-selected', fn: () => {
    AppPreview.applyMyTeamAudit('my-team-country-selected');
  }},
  { name: '14-tab-myteam-focused', fn: () => {
    AppPreview.applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'my_team' });
    const id = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
    ScheduleUI.applyAuditState({ matchId: id, selectedMatchId: id, scrollToMatchId: id, showScrollTop: true });
    BroadcastUI.applyAuditState({ showBroadcastDialog: true, focusedIndex: 1 });
  }}
];

const port = 8780;
const server = await serve(port);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto(`http://127.0.0.1:${port}/ui/1920/index.html?audit=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => typeof SportUI !== 'undefined');
await page.waitForFunction(() => document.getElementById('dev-status')?.textContent?.includes('матчей'));
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(2000);

for (const state of STATES) {
  await page.evaluate((fnBody) => {
    if (typeof BroadcastUI !== 'undefined') BroadcastUI.hide();
    // eslint-disable-next-line no-eval
    eval('(' + fnBody + ')()');
  }, state.fn.toString());
  await page.waitForTimeout(450);
  await page.waitForFunction(() => {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('img.iv_flag_home, img.iv_flag_away, img.iv_flag'));
    return imgs.length === 0 || imgs.every(function (img) { return img.complete; });
  }).catch(function () {});
  await page.locator('#tv-stage').screenshot({ path: join(outDir, `${state.name}.png`) });
  console.log('saved', state.name);
}

await browser.close();
server.close();

console.log('\nComparing with scan/...');
const cmp = spawnSync('python3', [join(__dir, 'compare-fifa-audit.py')], { stdio: 'inherit' });
process.exit(cmp.status ?? 0);
