# Сверка с native ui-sport — список правок

Источник: `android-tv/ui/ui-sport` dimens.xml, layouts, SportScreenMetrics @ 1920 (dp×2).

## Критичные (размеры / отступы)

| # | Компонент | Было | Надо (native) |
|---|-----------|------|---------------|
| 1 | Focus border (schedule/bracket/my-team) | 2px | **4px** (2dp) |
| 2 | Кнопка «Вверх» | 36px высота, 14px текст, стрелка ↑ | **72px**, **28px** текст, без стрелки, radius 16px, pad 16×40 |
| 3 | Диалог каналов panel radius | 8px | **12px** (6dp) |
| 4 | My Team panel bg | rgba(255,255,255,0.04) | **#1AFFFFFF** (10% white) |
| 5 | My Team schedule padding-left | 119px на контейнере | **0** — 119px только date_block в секции |
| 6 | My Team match time | 22px | **24px** (12sp) |
| 7 | Rail back icon | 22×22 | **26×26** (vector viewport) |

## Средние (цвета / стили)

| # | Компонент | Было | Надо |
|---|-----------|------|------|
| 8 | schedule date text | rgba(255,255,255,0.7) | **#B3FFFFFF** |
| 9 | future match text | rgba 0.65 | **#A6FFFFFF** |
| 10 | menu divider | rgba 0.2 | **#33FFFFFF** |
| 11 | menu focus ring | inset 1px | **inset 1px, offset −2px** (0.5dp stroke, 1dp inset) |
| 12 | scroll-top / retry focus | нет | bg **#3386DBFF**, border **2px #86DBFF** |
| 13 | broadcast item focus | rgba 0.2 | **#3386DBFF** |

## Уже совпадает ✓

- Shell: rail 136px, кнопки 51×43, title 40px/38px top, tabs 22px/64px gap
- Schedule: карточка 73px, даты 60px, grid gap 11×10, section 46px
- Bracket: ячейка 222×90, коннекторы 4×106px, labels 24px
- My Team: panel 1070, колонки 348×50, match 88px, date col 119px, match 491px
- Menu: width 502, logo 56×42, items 34px icon, 36px text, spacing 11px
- Broadcast: panel 440px, item 72px, chevron 24px

## Статус: исправлено (2026-07-07)

Все пункты 1–13 применены. Повторный audit:

| Скрин | Было | Стало |
|-------|------|-------|
| `10-my-team-countries` | 62.6% | **28.7%** |
| `11-my-team-schedule-filtered` | 64.9% | **32.3%** |
| `12-my-team-country-selected` | 64.9% | **32.7%** |
| `09-rail-myteam-focused` | 66.2% | 60.7% |
| `05-scroll-top` | 15.8% | 15.8% (без изменений — уже хорошо) |

Ключевой фикс: убран лишний `padding-left: 119px` у `#rv_my_team_schedule` (119px — только ширина date_block в секции).
