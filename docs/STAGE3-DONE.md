# Этап 3 — расписание (завершён)

## Что сделано

| Артефакт | Путь |
|----------|------|
| Маппер API → секции | `ui/js/fifa-schedule-mapper.js` |
| Флаги (api-sports) | `ui/js/fifa-flag.js` |
| Рендер + dev API | `ui/js/schedule-ui.js` |
| Стили карточек | `ui/1920/css/schedule.css` |
| Audit | `scripts/audit-fifa-schedule.mjs` |

## ScheduleUI API

```js
ScheduleUI.render(fifa2026Response);
ScheduleUI.setFocusedMatch(matchId);   // play overlay
ScheduleUI.setSelectedMatch(matchId);  // белая карточка
ScheduleUI.showError(true, message);
ScheduleUI.showScrollTop(true);
ScheduleUI.scrollToMatch(matchId);
ScheduleUI.applyAuditState({ ... });   // для audit/preview
```

## Карточка матча

Классы: `future` | `available` | `live` | `selected` | `focused`

- Флаги: `https://media.api-sports.io/football/teams/{id}.png` по `team1_id` / `team2_id`
- Playoff без команд → «Н/Д» + placeholder флаги
- Счёт в box'ах при `score.team1` + `score.team2`

## Мок

`537347` (Мексика–Бразилия): добавлены `team1_id: 16`, `team2_id: 10` для флагов.

## Audit-скрины

```bash
node scripts/audit-fifa-schedule.mjs
# → screenshots/audit/07-schedule-from-top.png … 12-schedule-live-card.png
```

## Preview

http://127.0.0.1:8777/ui/1920/index.html — dev-panel «Расписание»

## Следующий этап

**Этап 4** — турнирная сетка (`bracket-ui.js`, connectors, ячейки).
