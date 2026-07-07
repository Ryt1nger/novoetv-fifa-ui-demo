# Референс UI раздела sport (Android TV)

Нативный модуль `ui-sport` в APK 4.x. Для Samsung — HTML/CSS по `DOM-CONTRACT.md`.

## Экраны

- `FragmentSport` — оболочка
- `FragmentSportSchedule` — расписание
- `FragmentSportBracket` — турнирная сетка
- `FragmentSportMyTeam` — моя команда
- `SportBroadcastSourcesDialogFragment` — выбор канала

Логика фокуса: `FragmentSport.kt`, `SportScheduleFocusController`, `SportBracketFocusController`, `SportMyTeamFocusController`.

## Merge

См. `docs/MERGE.md` (будет на этапе 7).
