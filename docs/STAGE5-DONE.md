# Stage 5 — Моя команда

## Сделано

### UI
- `ui/js/my-team-ui.js` — панель стран (3 колонки), фильтр расписания, фокус
- `ui/js/fifa-teams-mapper.js` — порт `Fifa2026TeamsMapper.toCountryNames`
- `ui/js/fifa-my-team-filter.js` — порт `SportMyTeamScheduleFilter`
- `ui/1920/css/my-team.css` — layout 1070+119+491px, вертикальный счёт

### Моки
- `mocks/fifa2026-teams.json` — 48 команд в порядке scan-сетки
- `mocks/fifa2026-myteam-scan.json` — матчи 11–13.06 для audit (Мексика–ЮАР, Бельгия…)

### Audit (5 экранов)
| Скрин | Состояние |
|-------|-----------|
| `09-rail-myteam-focused` | rail focus + Чехия |
| `10-my-team-countries` | вкладка, фокус Чехия, все матчи |
| `11-my-team-schedule-filtered` | Бельгия selected, Австралия focus, фокус матча |
| `12-my-team-country-selected` | Бельгия selected + focus |
| `14-tab-myteam-focused` | tab focus |

## Метрики audit (финальный прогон)

| Скрин | Full diff |
|-------|-----------|
| `10-my-team-countries` | 62.6% |
| `11-my-team-schedule-filtered` | 64.9% |
| `12-my-team-country-selected` | 64.9% |
| `14-tab-myteam-focused` | 51.1% |
| `09-rail-myteam-focused` | 66.2% |

Высокий content diff — ожидаемо: mock ≠ live API, шрифт Inter, субпиксельный рендер.

## DOM (сохранён)

`sport_my_team_root`, `my_team_countries_panel`, `rv_my_team_countries`, `rv_my_team_schedule`, `tv_my_team_schedule_empty`, `country_chip_root`, `tv_country_name`, `my_team_bullet`

Превью: `http://127.0.0.1:8777/ui/1920/index.html` → вкладка «Моя команда»
