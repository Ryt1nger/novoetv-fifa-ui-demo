# Этап 2 — оболочка sport (завершён)

## Что сделано

| Артефакт | Путь |
|----------|------|
| CSS tokens (dimens @ 1920) | `ui/1920/css/tokens.css` |
| Shell layout | `ui/1920/css/sport.css` |
| DOM API | `ui/js/sport-ui.js` |
| Preview + dev-panel | `ui/1920/index.html`, `ui/js/app-preview.js` |
| Standalone shell | `ui/1920/sport.html` |
| HTML skeleton | `ui/1920/html/sport-shell.html` |
| Audit script | `scripts/audit-fifa-shell.mjs` |

## SportUI API

```js
SportUI.init(menuMock);           // title, rail icons, tabs from fifa-menu.json
SportUI.setActiveTab('schedule'); // rail selected + tab selected + pager page
SportUI.setRailFocus('schedule'); // .focused on rail button
SportUI.setTabFocus('schedule');  // .focused on tab
SportUI.applyState({ activeTab, railFocus, tabFocus });
SportUI.getState();
```

## Dev-panel

- Вкладка (active page): schedule | bracket | my_team
- Rail focus / Tab focus — независимые зоны для audit
- Audit preset — 6 состояний как в `screenshots/scan/`

## Preview

```bash
cd /Users/a1111/tv-samsung/fifa-reference
python3 -m http.server 8777
# → http://127.0.0.1:8777/ui/1920/index.html
```

## Audit

```bash
cd /Users/a1111/tv-samsung/fifa-reference
node scripts/audit-fifa-all.mjs
# → screenshots/audit/ + screenshots/diff/ + docs/AUDIT-REPORT.md
```

См. `docs/AUDIT-REPORT.md` — сравнение с APK scan.

## Визуальные токены

- Фон: `#010E21`, rail: `#0A1628`
- Rail focus: `#86DBFF`, rail selected: `#FFFFFF`
- Tab text: 53% white → selected white
- Rail width: 136px, title 40px, tabs 22px, tab gap 64px

## Следующий этап

**Этап 3** — расписание (`schedule-ui.js`, карточки матчей, секции по датам).
