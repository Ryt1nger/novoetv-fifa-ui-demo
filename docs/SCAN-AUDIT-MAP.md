# Сверка scan PNG ↔ audit state

**Важно:** часть файлов в `screenshots/scan/` названа по фокусу rail/tab, но на кадре другой экран (ошибка съёмки на эмуляторе).

| Файл scan | Реальное содержимое | Audit state |
|-----------|---------------------|-------------|
| `01-tab-schedule-focused` | Расписание плей-офф (июль), tab focus | schedule + scroll к `PLAYOFF_18` + «Вверх» |
| `02-rail-schedule-focused` | То же + rail schedule focus | rail schedule + playoff scroll |
| `06-rail-bracket-focused` | Расписание плей-офф + rail bracket focus | schedule + rail bracket |
| `09-rail-myteam-focused` | **Сетка** + rail my_team focus | bracket + rail my_team |
| `08`, `13`, `14` | Расписание + диалог (Канада–Марокко) | schedule + `PLAYOFF_18` + dialog |
| `10–12` | Моя команда | my-team UI |

## Метрики audit (2026-07-07, после Inter + flags + bracket scan)

| Скрин | Full diff |
|-------|-----------|
| `01-tab-schedule-focused` | **40.4%** |
| `05-schedule-scroll-top` | **22.4%** |
| `08-bracket-playable-focused` | **20.4%** |
| `13-tab-bracket-focused` | **22.4%** |
| `14-tab-myteam-focused` | **22.4%** |
| `15-broadcast-dialog` | **22.4%** |
| `10-my-team-countries` | **30.3%** |
| `07-bracket-default` | **48.4%** |

## Ключевые фиксы

- Диалог каналов: матч **`PLAYOFF_18`** (Канада–Марокко, 1/8, 04.07), не `PLAYOFF_2`
- Единый мок `fifa2026-bracket-overlay.json` (R32…полуфинал) выровнен по scan `07`
- Удалён ошибочный `fifa2026-emulator-bracket.json` (неверный mapping PLAYOFF_21–30)
- Локальные флаги `assets/img/flags/` + Inter в `assets/fonts/`
- My Team audit: только матчи `MT*`; страна **Czechia** как на эмуляторе
- Парсинг kickoff без timezone-сдвига; play-overlay не скрывает время
- Меню убрано из preview (только `fifa-shell.json`)

## Оставшиеся отличия

- Shell ~14–16% (фон rail, отступы заголовка)
- Сетка `07` ~48%: позиции ячеек/коннекторы + часть матчей без точных имён в API
- Расписание июля: scroll/секции (~40–48%)
