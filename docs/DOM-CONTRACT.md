# DOM-контракт: ЧМ FIFA 2026 (не менять при merge в Samsung)

Источник: `android-tv/ui-sport` + APK `de.soft.novoetv.novoetvapplication`.  
Ядро должно использовать те же `id` / ключевые `class`, что и нативный `FragmentSport`.

## Точка входа — меню

| id | Назначение |
|----|------------|
| `ll_menu_sport` | Пункт меню «ЧМ FIFA 2026» |
| `iv_menu_sport` | Иконка (PNG `sport_icon`) |
| `tv_menu_sport` | Текст пункта |

Навигация: `FragmentType.SPORT` → `fragmentSport`.

---

## Оболочка — `sport_root`

| id / class | Назначение |
|------------|------------|
| `sport_root` | Корневой контейнер раздела |
| `sport_rail` | Левый rail (~7.08% ширины) |
| `sport_rail_buttons` | Колонка кнопок rail |
| `btn_sport_back` | Декоративная «назад» (не focusable в APK) |
| `btn_sport_rail_schedule` | Rail: расписание |
| `btn_sport_rail_bracket` | Rail: турнирная сетка |
| `btn_sport_rail_my_team` | Rail: моя команда |
| `tv_sport_title` | Заголовок экрана |
| `sport_tabs_container` | Блок вкладок |
| `sport_tab_track` | Линия-трек под вкладками |
| `sport_tabs` | Ряд вкладок |
| `tab_schedule` | Вкладка «Расписание игр» |
| `tab_bracket` | Вкладка «Турнирная сетка» |
| `tab_my_team` | Вкладка «Моя команда» |
| `tab_content_row` | Строка иконка+текст внутри вкладки |
| `iv_tab_icon` | Иконка вкладки |
| `tv_tab_label` | Текст вкладки |
| `sport_pager` | Контейнер страниц (ViewPager2) |

**Состояния rail / вкладок:** `selected`, `focused` (класс или псевдо-состояние для CSS).

---

## Расписание — `sport_schedule_root`

| id / class | Назначение |
|------------|------------|
| `sport_schedule_root` | Корень страницы |
| `rv_sport_schedule` | Список секций (RecyclerView) |
| `sport_schedule_error_container` | Блок ошибки |
| `tv_schedule_error` | Текст ошибки |
| `btn_schedule_retry` | Кнопка «Повторить» |
| `btn_schedule_scroll_top` | Кнопка «Вверх» |

### Секция / карточка матча

| id / class | Назначение |
|------------|------------|
| `match_card_root` | Карточка матча (focusable) |
| `meta_play_slot` | Слот группа/время или play |
| `tv_group` | Группа / стадия |
| `tv_time` | Время |
| `iv_match_play` | Иконка play (selected) |
| `match_main_content` | Блок команд |
| `tv_team_home` `tv_team_away` | Названия |
| `iv_flag_home` `iv_flag_away` | Флаги |
| `score_container` | Блок счёта |
| `tv_score_home` `tv_score_away` `tv_score_colon` | Цифры счёта |

**Классы состояния карточки:** `future`, `available`, `live`, `selected`, `focused` (логика — `SportMatchCardAvailability`).

---

## Турнирная сетка — `bracket_content_container`

| id | Назначение |
|----|------------|
| `bracket_content_container` | Корень |
| `bracket_connectors` | SVG/Canvas линии |
| `bracket_cells_container` | Ячейки матчей |
| `bracket_labels_container` | Подписи раундов |

### Ячейка bracket — `item_sport_bracket_match`

| id | Назначение |
|----|------------|
| `tv_date` | Дата |
| `tv_time` | Время |
| `tv_team_top` `tv_team_bottom` | Команды |

---

## Моя команда — `sport_my_team_root`

| id | Назначение |
|----|------------|
| `sport_my_team_root` | Корень |
| `my_team_countries_panel` | Левая панель |
| `rv_my_team_countries` | Сетка стран |
| `rv_my_team_schedule` | Расписание справа |
| `tv_my_team_schedule_empty` | Пустое состояние |

### Страна — `item_sport_my_team_country`

| id / class | Назначение |
|------------|------------|
| `tv_country_name` | Название |
| `my_team_bullet` | Маркер выбора |
| `.selected` `.focused` | Состояния |

---

## Диалог каналов — `sport_sources_dialog_root`

| id | Назначение |
|----|------------|
| `sport_sources_dialog_root` | Overlay |
| `sport_sources_panel` | Панель |
| `sport_sources_list` | Список |
| `tv_source_title` | Название канала (в item) |

---

## API-мок (не DOM)

```
GET tvmiddleware/api/api/v1.0/sport/fifa2026/
```

Файл: `mocks/fifa2026.json` — поля `teams`, `matches`, `demo`, `tournament`.

---

## Файлы референса

| Файл | Роль |
|------|------|
| `ui/1920/html/sport-shell.html` | HTML-скелет оболочки |
| `ui/js/fifa-data.js` | Загрузка моков |
| `ui/js/app-preview.js` | Dev preview (этап 1+) |
| `mocks/fifa-menu.json` | Меню + метаданные вкладок |
| `mocks/fifa-broadcast-sources.json` | Диалог каналов |
