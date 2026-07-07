# Audit: HTML vs APK (scan)

Автогенерация: `node scripts/audit-fifa-all.mjs`

## Исправления (2026-07-07)

- Этап 4: турнирная сетка (layout + mapper + UI + CSS).
- Этап 6: диалог каналов `sport_sources_dialog_root`.
- Audit: `07` фокус ЮАР–Канада; `08` расписание+диалог (как PNG scan).
- Пути иконок: `/assets/img/icons/…` (mask → 404 без абсолютного URL).
- Focus: `outline 2px #86DBFF`; кнопка «Вверх»; rail back 51×43px.

## Сравнение (полный кадр 1920×1080)

| Скрин | Область | Full | Shell | Content | Статус |
|-------|---------|------|-------|---------|--------|
| `01-tab-schedule-focused.png` | shell+schedule | 40.4% | 15.3% | 46.4% | shell +data |
| `02-rail-schedule-focused.png` | shell | 48.3% | 15.3% | 60.2% | shell +data |
| `02-schedule-from-top.png` | schedule layout | 42.4% | 15.3% | 42.4% | shell +data |
| `03-schedule-match-focus-top.png` | match focus + play | 44.1% | 15.3% | 46.2% | shell +data |
| `04-schedule-scrolled-mid.png` | scroll position | 47.9% | 15.3% | 52.5% | shell +data |
| `05-schedule-scroll-top-area.png` | scroll-top + dialog | 22.4% | 13.7% | 28.7% | shell |
| `06-rail-bracket-focused.png` | shell+bracket | 43.6% | 15.3% | 46.8% | shell +data |
| `07-bracket-default.png` | bracket grid | 48.4% | 15.5% | 62.2% | shell +data |
| `08-bracket-playable-focused.png` | schedule+dialog | 20.4% | 13.7% | 24.2% | shell |
| `13-tab-bracket-focused.png` | shell+bracket | 22.4% | 13.8% | 28.7% | shell |
| `15-broadcast-sources-dialog.png` | broadcast dialog | 22.4% | 13.7% | — | shell (dialog only) |
| `09-rail-myteam-focused.png` | shell+my team | 34.8% | 15.5% | 40.3% | shell +data |
| `10-my-team-countries.png` | countries+schedule | 30.3% | 16.2% | 27.2% | shell |
| `11-my-team-schedule-filtered.png` | filter+focus match | 35.1% | 16.2% | 36.9% | shell +data |
| `12-my-team-country-selected.png` | country selected | 35.5% | 16.2% | 37.9% | shell +data |
| `14-tab-myteam-focused.png` | shell+my team | 22.4% | 13.8% | 28.7% | shell |

## Diff-изображения

Папка `screenshots/diff/` — слева APK scan, справа подсветка отличий.

## Не в scope (ещё не вёрстка)


## Известные ожидаемые отличия

- **Данные мока** — даты/команды в `fifa2026.json` ≠ live API на эмуляторе.
- **05-scroll-top** — диалог каналов + кнопка «Вверх» (как в scan).
