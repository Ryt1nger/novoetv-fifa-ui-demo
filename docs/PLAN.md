# План: вёрстка раздела «ЧМ FIFA 2026» для Samsung TV

## Цель

Визуальный перенос 1:1 раздела FIFA 2026 из `android-tv/ui-sport` в `fifa-reference/` — по той же схеме, что `player-reference/`: HTML/CSS, моки, DOM-контракт, preview + audit-скрины. Логика фокуса/навигации описывается, но **не реализуется** до merge в ядро.

## Scope

| В scope | Вне scope (пока нет репо) |
|---------|--------------------------|
| HTML/CSS 1920×1080 | Реальный API / auth |
| Моки из `fifa2026_*.json` | `SportViewModel`, Retrofit |
| DOM id/class под ядро | Запуск плеера с канала |
| Preview + Playwright audit | Тарифная видимость меню |

## Экраны (приоритет)

| # | Экран | id / fragment | P |
|---|-------|---------------|---|
| S0 | Пункт меню | `ll_menu_sport` | P0 — часть общего меню |
| S1 | Оболочка sport | `sport_root` | P0 |
| S2 | Расписание | `sport_schedule_root` | P0 |
| S3 | Турнирная сетка | `bracket_content_container` | P0 |
| S4 | Моя команда | `sport_my_team_root` | P1 |
| S5 | Диалог каналов | `sport_sources_dialog_root` | P1 |

## Этапы

### Этап 0 — Сканирование + скрины ✅

- [x] Инвентаризация экранов по `ui-sport`
- [x] Карта навигации из Fragment/FocusController
- [x] Цвета, dimens, strings
- [x] 18 скринов на эмуляторе (`screenshots/scan/`)
- [ ] Error-state и empty my-team (опционально)

См. `SCAN.md`

---

### Этап 1 — Подготовка ✅ ЗАВЕРШЁН

- [x] Структура `fifa-reference/` (как `player-reference`)
- [x] `DOM-CONTRACT.md` — id/class для ядра Samsung
- [x] Иконки: `sport_icon.png`, football, tournir_grid, your_team, rail_back, play (APK + SVG)
- [x] `mocks/fifa2026.json` — merge sample + playoff (34 матча)
- [x] `mocks/fifa-menu.json` + `fifa-broadcast-sources.json`
- [x] README + dev-links + preview shell

См. `STAGE1-DONE.md`

**Выход:** preview открывается, моки загружаются.

---

### Этап 2 — Оболочка S1 ✅ ЗАВЕРШЁН

- [x] `ui/1920/sport.html` — shell без контента вкладок
- [x] Левый rail: 3 focusable кнопки + декоративный back
- [x] Заголовок + 3 вкладки с индикатором
- [x] CSS: `sport_bg`, rail, tabs (`colors.xml` → CSS vars)
- [x] `sport-ui.js` — API: `setActiveTab()`, `setRailFocus()`, `setTabFocus()`, `applyState()`
- [x] Dev-panel: пресеты audit-состояний
- [x] `scripts/audit-fifa-shell.mjs` → `screenshots/audit/`

См. `STAGE2-DONE.md`

**Критерий:** визуально совпадает с `fragment_sport.xml` при 1920×1080.

---

### Этап 3 — Расписание S2 ✅ ЗАВЕРШЁН

- [x] `fifa-schedule-mapper.js` — секции по датам, availability
- [x] `schedule-ui.js` — рендер секций, 2 колонки, фокус/play overlay
- [x] `schedule.css` — карточки future/available/live/selected/focused
- [x] `fifa-flag.js` — флаги api-sports по team_id
- [x] Error + scroll-top в dev-panel
- [x] `scripts/audit-fifa-schedule.mjs` → `screenshots/audit/07–12`

См. `STAGE3-DONE.md`

**Навигация (документ + заглушки в preview):**
- 2D grid внутри секции
- ← → rail, ↑ → tab

**Критерий:** audit-скрины 02–06.

---

### Этап 4 — Турнирная сетка S3 ✅ ЗАВЕРШЁН

- [x] `bracket-ui.js` — позиции из `SportBracketLayoutSpec` (dp → px @ 1920)
- [x] SVG коннекторы (`SportBracketConnectorsView`)
- [x] Ячейки `item_sport_bracket_match` + labels раундов
- [x] Подстановка данных из `Fifa2026BracketMapper`
- [x] Состояния ячеек (future/live/available/focus/selected)

См. `STAGE4-DONE.md`

**Критерий:** audit-скрины 07–08.

---

### Этап 5 — Моя команда S4 ✅ ЗАВЕРШЁН

- [x] Левая панель: grid стран, selected/focused
- [x] Правая колонка: `item_sport_my_team_match` (вертикальный счёт)
- [x] Фильтр по выбранным странам (JS)
- [ ] Empty state (опционально — scan `11-my-team-empty` ❌)

См. `STAGE5-DONE.md`

**Критерий:** audit-скрины 09–12, 14.

---

### Этап 6 — Диалог каналов S5 ✅ ЗАВЕРШЁН

- [x] Overlay + панель источников
- [x] Focus state на пункте
- [x] Показ из preview по клику на playable матч

См. `STAGE4-DONE.md` (broadcast section)

**Критерий:** audit-скрин 15 (+ 05, 08 с диалогом).

---

### Этап 0 (меню) — Пункт «ЧМ FIFA 2026» ✅ ЗАВЕРШЁН

- [x] `menu-ui.js` + `menu.css` — overlay `main_menu_contener` поверх sport
- [x] `mocks/fifa-menu.json` — mainMenu items + footer
- [x] `assets/img/icons/sport_icon.png`
- [x] Audit `00-menu-fifa-focused`

---

### Этап 7 — Склейка + аудит ✅ ЗАВЕРШЁН

- [x] `ui/1920/index.html` — sport shell + все вкладки + menu overlay
- [x] `app-preview.js` — dev-panel (как player-reference)
- [x] `scripts/audit-fifa-all.mjs` → `screenshots/audit/` (17 состояний)
- [x] `docs/AUDIT-REPORT.md` — сравнение с эталоном
- [x] `docs/MERGE.md` — инструкция для GitLab

См. `STAGE7-DONE.md`

---

### Этап 8 — Merge в ядро (когда будет доступ)

- [ ] Перенос `ui/1920/*`, `ui/js/*` в Samsung widget
- [ ] Подключение `fifa2026` API в ядре
- [ ] Реализация focus manager по контракту
- [ ] Интеграция с плеером (`SportBroadcastResolver` → player screen)

---

## Оценка сроков

| Этап | Дни |
|------|-----|
| 0 Скан | ✅ |
| 1 Подготовка | 1–2 |
| 2 Shell | 1 |
| 3 Расписание | 2–3 |
| 4 Сетка | ✅ |
| 5 Моя команда | ✅ |
| 6 Диалог | ✅ |
| 0 Меню | ✅ |
| 7 Аудит | ✅ |
| **Итого вёрстка** | **✅ готово** |

## Риски

1. **Нет живых скринов 4.x** — возможны расхождения в деталях (отступы, скролл). Нужен APK или JDK для сборки `android-tv`.
2. **Турнирная сетка** — самый трудоёмкий экран (геометрия + коннекторы).
3. **Флаги команд** — внешние URL `media.api-sports.io`; для офлайн-preview нужен кэш или placeholder.
4. **Меню S0** — может верстаться в отдельной задаче «новое главное меню»; sport shell использует свой внутренний rail.

## Зависимости от player-reference

- Общие: `base.css`, шрифты, паттерн preview/audit
- Плеер: диалог каналов → тот же player screen (контракт уже в `player-reference`)

## Структура проекта (целевая)

```
fifa-reference/
├── docs/
│   ├── SCAN.md
│   ├── PLAN.md
│   ├── DOM-CONTRACT.md
│   └── MERGE.md
├── mocks/
│   └── fifa2026.json
├── ui/
│   ├── 1920/
│   │   ├── index.html
│   │   ├── sport.html
│   │   └── css/
│   └── js/
│       ├── sport-ui.js
│       ├── schedule-ui.js
│       ├── bracket-ui.js
│       ├── myteam-ui.js
│       └── app-preview.js
├── scripts/
│   └── audit-fifa.mjs
└── screenshots/
    ├── scan/          ← эталонные скрины с устройства
    └── audit-all/     ← автоматические из preview
```
