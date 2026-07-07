# Stage 7 — Финальный аудит

## Сделано

### Склейка
- `ui/1920/index.html` — sport shell + расписание + сетка + моя команда + диалог + menu overlay
- `app-preview.js` — dev-panel, audit presets, `applyMenuAudit` / `applyMyTeamAudit` / …
- `MenuUI.hide()` перед всеми audit-состояниями кроме `00-menu-fifa-focused`

### Audit pipeline
```bash
node scripts/audit-fifa-all.mjs   # 17 состояний → screenshots/audit/
python3 scripts/compare-fifa-audit.py  # diff → screenshots/diff/
```

Порт сервера audit: **8780**. Playwright из `player-reference/node_modules`.

### Метрики (2026-07-07, полный прогон)

| Группа | Лучшие | Худшие | Примечание |
|--------|--------|--------|------------|
| Shell | ~13–16% | ~16% | шрифт Inter vs browser |
| Schedule | **15.8%** (`05`) | 58.9% (`02-rail`) | content diff от mock data |
| Bracket | **19.4%** (`08` dialog) | 59.3% (`06-rail`) | `07` 36.5% — mock ≠ live 1/8 |
| My Team | 51.1% (`14-tab`) | 66.2% (`09-rail`) | даты/матчи mock overlay |
| Menu | **9.7% shell** | 49.6% content | sport bg за меню ≠ scan |
| Dialog | **21.4%** | — | только overlay |

Полная таблица: `docs/AUDIT-REPORT.md`

## 17 audit-состояний

`00-menu` · `01–05 schedule` · `06–08 bracket` · `09–12,14 my-team` · `13 tab-bracket` · `15 broadcast`

## Опционально (не блокирует merge)

- Empty state my-team (`11-my-team-empty.png` — scan ❌)
- `00-menu-overlay.png` — отдельный вариант меню поверх sport
- Подключение Inter для снижения shell diff
- Больше playoff mock data для quarter-finals в сетке

## Merge

См. `docs/MERGE.md` — перенос в Samsung widget по модели `player-reference`.

Превью: `python3 -m http.server 8777` → `/ui/1920/index.html`
