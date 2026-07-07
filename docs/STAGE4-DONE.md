# Stage 4 — Bracket + Broadcast dialog

## Сделано

### Bracket (этап 4)
- `ui/js/fifa-bracket-layout.js` — порт `SportBracketLayoutSpec` (32 ячейки, коннекторы, лейблы)
- `ui/js/fifa-bracket-mapper.js` — порт `Fifa2026BracketMapper`
- `ui/js/bracket-ui.js` — рендер сетки, фокус, play overlay
- `ui/1920/css/bracket.css` — карточки 222×90, коннекторы, стили future/available/live

### Broadcast dialog (этап 6)
- `ui/js/broadcast-ui.js` + `ui/1920/css/broadcast.css`
- Диалог `sport_sources_dialog_root` из `fifa-broadcast-sources.json`

### Моки под scan
- `mocks/fifa2026-scan-matches.json` — групповой этап 26–27.06 (как в scan)
- `mocks/fifa2026-bracket-overlay.json` — PLAYOFF_1…16 с командами/счётом
- Deep-merge в `fifa-data.js`

### Audit
- 11 состояний в `audit-fifa-all.mjs` (включая bracket + dialog)
- `07-bracket-default` — фокус `left_r0_0` (ЮАР–Канада)
- `08-bracket-playable-focused` — расписание PLAYOFF_2 + диалог (как в scan PNG)

## Метрики audit (финальный прогон)

| Скрин | Full diff |
|-------|-----------|
| 05-scroll-top | **15.8%** |
| 08-playable+dialog | **19.4%** |
| 13-tab-bracket | 44.2% |
| 07-bracket-default | 36.5% |
| Shell (все) | ~14–16% |

## Опционально для снижения diff

- **Shell ~15%** — шрифт Inter, субпиксельные отличия рендера
- **Bracket ~36%** — 1/4 в scan заполнены live API; мок покрывает 1/8, не все четвертьфиналы

Превью: `python3 -m http.server 8777` → `/ui/1920/index.html`
