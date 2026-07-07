# Этап 1 — завершён

## Что сделано

| Задача | Статус | Артефакт |
|--------|--------|----------|
| Структура `fifa-reference/` | ✅ | как `player-reference` |
| DOM-контракт | ✅ | `docs/DOM-CONTRACT.md` |
| Иконки из APK 4.x | ✅ | `assets/img/icons/` |
| Мок API fifa2026 | ✅ | `mocks/fifa2026.json` (34 матча) |
| Мок меню | ✅ | `mocks/fifa-menu.json` |
| Мок диалога каналов | ✅ | `mocks/fifa-broadcast-sources.json` |
| CSS tokens | ✅ | `ui/1920/css/tokens.css` |
| Preview (пустой shell) | ✅ | `ui/1920/index.html` |
| Dev-links | ✅ | `docs/dev-links.html` |
| Скрины эталона | ✅ | `screenshots/scan/` (18 шт.) |

## Как открыть

```bash
cd fifa-reference
python3 -m http.server 8777
```

Открыть: http://127.0.0.1:8777/ui/1920/index.html

или `open fifa-reference/index.html` (нужен локальный сервер для fetch моков).

## Preview

- Загружает все 3 JSON-мока
- Показывает заголовок и вкладки (иконки + текст)
- Dev-panel: переключение вкладок-заглушек
- Контент страниц — на этапе 2+

## Следующий этап

**Этап 2** — полная оболочка `FragmentSport`: rail, вкладки, selected/focused состояния 1:1 со скринами.
