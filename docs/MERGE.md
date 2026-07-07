# Merge в ядро Samsung TV

Инструкция для переноса `fifa-reference/` в production widget (модель как `player-reference/`).

## Что переносить

```
ui/1920/
  index.html          → shell preview (или разбить на fragments)
  css/*.css           → стили раздела sport + menu overlay
ui/js/
  fifa-data.js        → загрузчик API (заменить моки на fetch)
  fifa-schedule-mapper.js
  fifa-bracket-layout.js
  fifa-bracket-mapper.js
  fifa-teams-mapper.js
  fifa-my-team-filter.js
  fifa-flag.js
  sport-ui.js
  schedule-ui.js
  bracket-ui.js
  my-team-ui.js
  broadcast-ui.js
  menu-ui.js          → только если меню в том же widget
assets/img/icons/     → sport_icon.png + SVG rail/tabs
docs/DOM-CONTRACT.md → контракт id для ядра
```

## DOM-контракт

**Не менять** `id` из `docs/DOM-CONTRACT.md` — ядро навешивает focus manager и API.

Ключевые корни:
- `sport_root` — оболочка раздела
- `sport_schedule_root` / `bracket_content_container` / `sport_my_team_root`
- `sport_sources_dialog_root`
- `ll_menu_sport` — пункт главного меню (в `include_menu` ядра)

## API

```
GET /tvmiddleware/api/api/v1.0/sport/fifa2026/
```

Ответ → `Fifa2026ResponseDto` (поля `teams`, `matches`, `demo`).

В preview: `FifaData.loadAll()` → заменить на `fetch` с auth headers ядра.

## Focus / навигация (реализовать в ядре)

| Зона | Контроллер (референс) |
|------|------------------------|
| Rail | `FragmentSport` |
| Tabs | `FragmentSport` |
| Schedule grid | `SportScheduleFocusController` |
| Bracket cells | `SportBracketFocusController` |
| My team countries | `SportMyTeamFocusController` |
| My team schedule | `SportScheduleFocusController` |
| Broadcast dialog | modal list focus |
| Menu | `MainActivity` menu focus |

Preview только рендерит состояния через `applyState` / `applyAuditState`.

## Плеер

Playable матч → `SportBroadcastResolver` → экран плеера (`player-reference`).

DOM: клик на `.match_card_root.playable` / `iv_match_play` → ядро открывает канал.

## Чеклист merge

1. Скопировать CSS vars из `tokens.css` в тему Samsung
2. Подключить JS-модули в bundle ядра (или IIFE как сейчас)
3. `SportUI.init()` при входе в `fragmentSport`
4. `ScheduleUI.render(apiResponse)` при загрузке fifa2026
5. Переключение вкладок → `SportUI.setActiveTab`
6. Тест: pixel audit `node scripts/audit-fifa-all.mjs` vs `screenshots/scan/`

## Audit

```bash
cd fifa-reference
node scripts/audit-fifa-all.mjs
```

Отчёт: `docs/AUDIT-REPORT.md`, diff: `screenshots/diff/`.

Целевые метрики shell: <15%, ключевые экраны (05, 08, 15): <25% full frame.
