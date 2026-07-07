# Сканирование раздела «ЧМ FIFA 2026»

Дата: 2026-07-07  
Источники: `Documents/TV/android-tv` (модуль `ui-sport`), строки APK `new-4.000`, скрин меню от заказчика.

## Съёмка на эмуляторе (2026-07-07)

| Параметр | Значение |
|----------|----------|
| Пакет | `de.soft.novoetv.novoetvapplication` |
| Разрешение | 1920×1080 |
| Папка | `screenshots/scan/` |
| Скрипт | `scripts/run-fifa-scan.sh` |

**Не снято:** error-state расписания (нужен офлайн/API fail), selected+play на расписании отдельным кадром (есть на `02-schedule-from-top`).

**Диалог каналов:** снят (`15-broadcast-sources-dialog.png`), плеер **не** открывали.

---

## Карта раздела

```
Главное меню
  └── ll_menu_sport  «ЧМ FIFA 2026»  (sport_icon)
        └── FragmentSport  (fragment_sport)
              ├── Левый rail: расписание | сетка | моя команда
              ├── Заголовок: «Чемпионат мира по футболу FIFA 2026»
              ├── Вкладки: Расписание игр | Турнирная сетка | Моя команда
              └── ViewPager2
                    ├── FragmentSportSchedule
                    ├── FragmentSportBracket
                    └── FragmentSportMyTeam
                          └── (из матча) SportBroadcastSourcesDialog → плеер
```

---

## Экраны и состояния

### S0 — Точка входа: меню

| Поле | Значение |
|------|----------|
| Layout | `app/.../include_menu.xml` → `ll_menu_sport` |
| Текст | `tx_menu_sport` = «ЧМ FIFA 2026» |
| Иконка | `@drawable/sport_icon` (цветной логотип FIFA) |
| Видимость | `UserPreferences.isSportSectionVisible()` — тариф + дата до 30.07.2026 |
| Фокус | `sel_btn_menu` — белая обводка rounded rect |
| Навигация | ↑↓ по меню, OK → `fragmentSport`, меню остаётся как overlay (`sportMenuOverlayVisible`) |
| Скрин | `screenshots/scan/00-menu-fifa-focused.png` ✅ |

---

### S1 — Оболочка раздела (FragmentSport)

| Поле | Значение |
|------|----------|
| Root id | `sport_root` |
| Фон | `#010E21` (`sport_bg`) |
| Левый rail | `sport_rail` ~7.08% ширины, фон `#0A1628` |
| Кнопки rail | `btn_sport_rail_schedule`, `_bracket`, `_my_team` |
| Кнопка «назад» | `btn_sport_back` — **не focusable** (декоративная) |
| Заголовок | `tv_sport_title` |
| Вкладки | `tab_schedule`, `tab_bracket`, `tab_my_team` |
| Контент | `sport_pager` (ViewPager2, swipe отключён) |

**Состояния rail/вкладок:**
- `selected` — белый фон кнопки rail / белый индикатор вкладки
- `focused` — голубой `#86DBFF`
- При фокусе на вкладке — переключение страницы без входа в контент
- OK на вкладке/rail — вход в контент (фокус на первый элемент)

**Навигация (FragmentSport):**
| Клавиша | Контекст | Действие |
|---------|----------|----------|
| ← | rail | выход в меню (`exitSportSection`) |
| → | rail | вход в контент вкладки |
| ↓ | вкладка | вход в контент |
| BACK | контент my team / bracket | фокус на rail |
| BACK | вкладка / rail | выход в меню |

**Скрины:** ❌ не сняты (нужен запущенный 4.x)

---

### S2 — Расписание игр (FragmentSportSchedule)

| Поле | Значение |
|------|----------|
| Root | `sport_schedule_root` |
| Список | `rv_sport_schedule` — секции по датам |
| Секция | `item_sport_schedule_section` — заголовок даты + сетка 2 колонки |
| Карточка | `item_sport_match` — группа, время, флаги, счёт, команды |

**Состояния карточки матча** (`SportMatchCardAvailability`):

| Состояние | Условие | Фон | Текст |
|-----------|---------|-----|-------|
| FUTURE | дата > сегодня, нет счёта | `#2A4057` | 65% white |
| AVAILABLE | завершён / доступен | `#1A2D42` | white |
| LIVE | `isLive` | `#BEE0C2` | `#1A2D42` |
| focused | D-pad | border `#86DBFF` 2dp | — |
| selected | OK на playable | white bg | dark text + play icon |

**Доп. состояния экрана:**
- **Loading** — данные грузятся, список пуст (нет отдельного UI, `ResultWrapper.Loading`)
- **Error** — `sport_schedule_error_container`: «Не удалось загрузить расписание» + `btn_schedule_retry`
- **Scroll top** — `btn_schedule_scroll_top` «Вверх» (виден при scroll > 0)

**Навигация (SportScheduleFocusController):**
- Сетка 2×N внутри секции даты
- ← из левой колонки → rail schedule
- ↑ из первой строки → вкладка «Расписание»
- ↓ внизу → кнопка «Вверх» (если видна)
- OK на playable → диалог источников

**API:** `Fifa2026ScheduleMapper.toScheduleItems(dto)`

**Скрины:** ❌

---

### S3 — Турнирная сетка (FragmentSportBracket)

| Поле | Значение |
|------|----------|
| Root | `bracket_content_container` |
| Коннекторы | `SportBracketConnectorsView` — белые линии между парами |
| Ячейки | `item_sport_bracket_match` — абсолютное позиционирование |
| Подписи раундов | `item_sport_bracket_round_label` |

**Раунды (strings):**
- 1/8 финала (`sport_bracket_round_of_16`)
- 1/4 финала (`sport_bracket_quarter`)
- Полуфинал (`sport_bracket_semi`)
- Финал (`sport_bracket_final`)
- Матч за 3е место (`sport_bracket_third_place`)

**Состояния ячейки:** те же FUTURE / AVAILABLE / LIVE / focused / selected  
Placeholder команды: «Н/Д» (`sport_bracket_tbd`) до подстановки из API

**Навигация (SportBracketFocusController):**
- Пространственный переход между ячейками (ближайшая по координатам)
- ← с левого края → rail bracket
- ↑ с финала → вкладка «Турнирная сетка»
- OK на playable → диалог источников

**API:** `Fifa2026BracketMapper.toCellMatches(dto)`

**Скрины:** ❌

---

### S4 — Моя команда (FragmentSportMyTeam)

| Поле | Значение |
|------|----------|
| Root | `sport_my_team_root` |
| Панель стран | `my_team_countries_panel` + `rv_my_team_countries` (grid) |
| Ячейка страны | `item_sport_my_team_country` — bullet + название |
| Расписание | `rv_my_team_schedule` — 1 колонка, другой layout карточки |
| Пусто | `tv_my_team_schedule_empty` — «Нет матчей для выбранных команд» |

**Состояния страны:**
- default — white text
- selected — orange `#FF7C00` + bullet
- focused — голубая обводка `#86DBFF`

**Логика:**
- Мультивыбор стран (toggle OK)
- Фильтр матчей `SportMyTeamScheduleFilter`
- Дефолтный набор в `SportMyTeamCountriesData.defaultSelectedNames`

**Навигация:**
- Grid стран: ← → ↑ ↓, ← с левого края → rail
- → с правого края → расписание отфильтрованных матчей
- ↑ из верхнего ряда стран → вкладка

**Скрины:** ❌

---

### S5 — Диалог источников трансляции

| Поле | Значение |
|------|----------|
| Класс | `SportBroadcastSourcesDialogFragment` |
| Layout | `dialog_sport_broadcast_sources` |
| Overlay | `#CC010E21` |
| Панель | 220dp, фон `#1B2A40` |
| Пункт | `item_sport_broadcast_source` — название канала + chevron |

**Навигация:** ↑↓ между источниками, OK → `SportBroadcastResolver.openPlayer`, BACK/← → закрыть

**Скрины:** ❌

---

## Данные и API (для моков)

```
GET tvmiddleware/api/api/v1.0/sport/fifa2026/
```

DTO: `Fifa2026ResponseDto` — `teams`, `matches`, `demo`, `tournament`, `updated_at`

Тестовые JSON (эталон структуры):
- `ui-sport/src/test/resources/fifa2026_sample.json` — групповой этап
- `ui-sport/src/test/resources/fifa2026_playoff_sample.json` — плей-офф

---

## Файлы-эталоны (Android)

| Компонент | Путь |
|-----------|------|
| Shell | `ui-sport/.../FragmentSport.kt`, `fragment_sport.xml` |
| Расписание | `FragmentSportSchedule.kt`, `fragment_sport_schedule.xml` |
| Сетка | `FragmentSportBracket.kt`, `bracket/*` |
| Моя команда | `FragmentSportMyTeam.kt`, `myteam/*` |
| Стили | `res/values/colors.xml`, `dimens.xml` |
| Мапперы | `Fifa2026*Mapper.kt` |
| ViewModel | `SportViewModel.kt` |
| Меню | `app/.../include_menu.xml`, `MainActivity.kt` |

---

## Чеклист скринов (факт)

| Файл | Описание | Статус |
|------|----------|--------|
| `00-menu-fifa-focused.png` | Пункт меню «ЧМ FIFA 2026» в фокусе | ✅ |
| `00-menu-overlay.png` | Меню поверх раздела sport | ✅ |
| `01-tab-schedule-focused.png` | Вкладка «Расписание игр» в фокусе | ✅ |
| `02-rail-schedule-focused.png` | Левый rail: расписание | ✅ |
| `02-schedule-from-top.png` | Расписание с начала (групповой этап) | ✅ |
| `03-schedule-match-focus-top.png` | Фокус на матче (play icon) | ✅ |
| `04-schedule-scrolled-mid.png` | Прокрутка вниз (1/8, 1/4) | ✅ |
| `05-schedule-scroll-top-area.png` | Кнопка «Вверх» видна | ✅ |
| `06-rail-bracket-focused.png` | Rail: турнирная сетка | ✅ |
| `07-bracket-default.png` | Сетка целиком | ✅ |
| `08-bracket-playable-focused.png` | Фокус на ячейке сетки | ✅ |
| `09-rail-myteam-focused.png` | Rail: моя команда | ✅ |
| `10-my-team-countries.png` | Список стран + расписание | ✅ |
| `11-my-team-schedule-filtered.png` | Фокус на расписании справа | ✅ |
| `12-my-team-country-selected.png` | Выбранная страна (оранжевый) | ✅ |
| `13-tab-bracket-focused.png` | Вкладка «Турнирная сетка» | ✅ |
| `14-tab-myteam-focused.png` | Вкладка «Моя команда» | ✅ |
| `15-broadcast-sources-dialog.png` | Диалог выбора канала | ✅ |
| `06-schedule-error.png` | Ошибка загрузки | ❌ |
| `11-my-team-empty.png` | Пустое расписание | ❌ |

---

## Отличие от v3.038 (widget2)

В APK 3.038 **нет** sport-модуля. Раздел FIFA — **нативный Android** (4.x), не HTML widget2.  
Для Samsung TV вёрстка делается **отдельным HTML/CSS референсом** по образцу `player-reference`, с сохранением DOM-контракта под будущее ядро.
