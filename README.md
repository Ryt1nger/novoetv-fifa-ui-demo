# FIFA 2026 — reference (Samsung TV)

Референс вёрстки раздела «ЧМ FIFA 2026» для Samsung TV (по образцу [novoetv-player-ui-demo](https://github.com/Ryt1nger/novoetv-player-ui-demo)).

**Демо:** https://ryt1nger.github.io/novoetv-fifa-ui-demo/ui/1920/index.html

**Статус:** shell, расписание, сетка, моя команда, диалог каналов. Готово к merge в ядро.

## Быстрый старт

```bash
cd fifa-reference
python3 -m http.server 8777
# → http://127.0.0.1:8777/ui/1920/index.html
```

Управление: клик по карточкам и вкладкам; **двойной клик** по матчу — диалог каналов; **back** в dev-панели или клик мимо — закрыть каналы.

## Audit

```bash
node scripts/audit-fifa-all.mjs
# скрины → screenshots/audit/
# отчёт → docs/AUDIT-REPORT.md
```

## Флаги и шрифты

```bash
node scripts/cache-flags.mjs   # media.api-sports.io → assets/img/flags/
```

Шрифт Inter — локально в `assets/fonts/` (без Google Fonts CDN).

## Документация

| Документ | Описание |
|----------|----------|
| [docs/PLAN.md](docs/PLAN.md) | Поэтапный план (все этапы ✅) |
| [docs/SCAN.md](docs/SCAN.md) | Инвентаризация + скрины с эмулятора |
| [docs/SCAN-AUDIT-MAP.md](docs/SCAN-AUDIT-MAP.md) | Соответствие scan PNG ↔ audit state |
| [docs/DOM-CONTRACT.md](docs/DOM-CONTRACT.md) | id/class для ядра Samsung |
| [docs/AUDIT-REPORT.md](docs/AUDIT-REPORT.md) | Сравнение preview vs APK scan |
| [docs/MERGE.md](docs/MERGE.md) | Инструкция merge в production widget |
| [docs/STAGE7-DONE.md](docs/STAGE7-DONE.md) | Итог финального аудита |
| [docs/dev-links.html](docs/dev-links.html) | Ссылки для разработки |

## Структура

```
fifa-reference/
├── index.html              → редирект на preview
├── mocks/
│   ├── fifa2026.json
│   ├── fifa2026-scan-matches.json
│   ├── fifa2026-bracket-overlay.json   # R32…полуфинал по scan 07
│   ├── fifa2026-myteam-scan.json
│   ├── fifa2026-teams.json
│   ├── fifa-shell.json
│   └── fifa-broadcast-sources.json
├── assets/
│   ├── fonts/              # Inter Regular/Medium/SemiBold
│   └── img/
│       ├── flags/          # кэш флагов (cache-flags.mjs)
│       └── icons/
├── ui/
│   ├── 1920/
│   │   ├── index.html
│   │   └── css/
│   └── js/
│       ├── fifa-data.js, fifa-flag.js
│       ├── sport-ui.js, schedule-ui.js, bracket-ui.js
│       ├── my-team-ui.js, broadcast-ui.js
│       └── app-preview.js
├── scripts/
│   ├── audit-fifa-all.mjs
│   ├── cache-flags.mjs
│   └── compare-fifa-audit.py
└── screenshots/
    ├── scan/               # эталон APK
    ├── audit/              # автоматические из preview
    └── diff/               # подсветка отличий
```

Эталон логики: `Documents/TV/android-tv/ui/ui-sport`.
