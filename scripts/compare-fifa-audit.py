#!/usr/bin/env python3
"""Compare screenshots/audit vs screenshots/scan — write diff images + report."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SCAN = ROOT / "screenshots" / "scan"
AUDIT = ROOT / "screenshots" / "audit"
DIFF = ROOT / "screenshots" / "diff"
REPORT = ROOT / "docs" / "AUDIT-REPORT.md"

# Implemented screens — same filename in scan/ and audit/
PAIRS = [
    ("01-tab-schedule-focused.png", "shell+schedule", True),
    ("02-rail-schedule-focused.png", "shell", True),
    ("02-schedule-from-top.png", "schedule layout", True),
    ("03-schedule-match-focus-top.png", "match focus + play", True),
    ("04-schedule-scrolled-mid.png", "scroll position", True),
    ("05-schedule-scroll-top-area.png", "scroll-top + dialog", True),
    ("06-rail-bracket-focused.png", "shell+bracket", True),
    ("07-bracket-default.png", "bracket grid", True),
    ("08-bracket-playable-focused.png", "schedule+dialog", True),
    ("13-tab-bracket-focused.png", "shell+bracket", True),
    ("15-broadcast-sources-dialog.png", "broadcast dialog", False),
    ("09-rail-myteam-focused.png", "shell+my team", True),
    ("10-my-team-countries.png", "countries+schedule", True),
    ("11-my-team-schedule-filtered.png", "filter+focus match", True),
    ("12-my-team-country-selected.png", "country selected", True),
    ("14-tab-myteam-focused.png", "shell+my team", True),
]

NOT_IMPLEMENTED = []


def diff_images(scan_path: Path, audit_path: Path, diff_path: Path, crop: tuple[int, int, int, int] | None = None) -> tuple[float, int]:
    a = Image.open(scan_path).convert("RGB")
    b = Image.open(audit_path).convert("RGB")
    if a.size != b.size:
        b = b.resize(a.size, Image.Resampling.LANCZOS)
    if crop:
        a = a.crop(crop)
        b = b.crop(crop)
    diff = ImageChops.difference(a, b)
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    # Highlight changed pixels in red overlay
    overlay = Image.new("RGB", a.size, (0, 0, 0))
    px = diff.load()
    ov = overlay.load()
    changed = 0
    for y in range(diff.height):
        for x in range(diff.width):
            r, g, b_ = px[x, y]
            if r + g + b_ > 24:
                changed += 1
                ov[x, y] = (255, 60, 60)
    composite = Image.blend(a, overlay, 0.45)
    draw = ImageDraw.Draw(composite)
    draw.text((16, 16), "SCAN (blend)", fill=(255, 255, 255))
    out = Image.new("RGB", (a.width * 2 + 8, a.height), (20, 20, 20))
    out.paste(a, (0, 0))
    out.paste(composite, (a.width + 8, 0))
    out.save(diff_path)
    total = a.width * a.height
    return (changed / total) * 100.0, changed


def main() -> None:
    DIFF.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Audit: HTML vs APK (scan)",
        "",
        "Автогенерация: `node scripts/audit-fifa-all.mjs`",
        "",
        "## Исправления (2026-07-07)",
        "",
        "- Этап 4: турнирная сетка (layout + mapper + UI + CSS).",
        "- Этап 6: диалог каналов `sport_sources_dialog_root`.",
        "- Audit: `07` фокус ЮАР–Канада; `08` расписание+диалог (как PNG scan).",
        "- Пути иконок: `/assets/img/icons/…` (mask → 404 без абсолютного URL).",
        "- Focus: `outline 2px #86DBFF`; кнопка «Вверх»; rail back 51×43px.",
        "",
        "## Сравнение (полный кадр 1920×1080)",
        "",
        "| Скрин | Область | Full | Shell | Content | Статус |",
        "|-------|---------|------|-------|---------|--------|",
    ]

    SHELL_CROP = (0, 0, 1920, 155)
    CONTENT_CROP = (136, 155, 1920 - 136, 700)

    for name, area, content_cmp in PAIRS:
        scan_f = SCAN / name
        audit_f = AUDIT / name
        if not scan_f.exists():
            lines.append(f"| `{name}` | {area} | — | — | — | scan отсутствует |")
            continue
        if not audit_f.exists():
            lines.append(f"| `{name}` | {area} | — | — | — | audit не снят |")
            continue
        pct, _ = diff_images(scan_f, audit_f, DIFF / name)
        shell_pct, _ = diff_images(scan_f, audit_f, DIFF / ("shell-" + name), crop=SHELL_CROP)
        content_pct = None
        if content_cmp:
            content_pct, _ = diff_images(scan_f, audit_f, DIFF / ("content-" + name), crop=CONTENT_CROP)
        status = "OK" if shell_pct < 10 else ("shell" if shell_pct < 18 else "review")
        if content_cmp and content_pct is not None and content_pct > 35:
            status += " +data"
        if not content_cmp:
            status += " (dialog only)"
        c_str = f"{content_pct:.1f}%" if content_pct is not None else "—"
        lines.append(f"| `{name}` | {area} | {pct:.1f}% | {shell_pct:.1f}% | {c_str} | {status} |")
        print(f"{name}: full={pct:.1f}% shell={shell_pct:.1f}% content={c_str}")

    lines += [
        "",
        "## Diff-изображения",
        "",
        "Папка `screenshots/diff/` — слева APK scan, справа подсветка отличий.",
        "",
        "## Не в scope (ещё не вёрстка)",
        "",
    ]
    for n in NOT_IMPLEMENTED:
        lines.append(f"- `{n}`")

    lines += [
        "",
        "## Известные ожидаемые отличия",
        "",
        "- **Данные мока** — даты/команды в `fifa2026.json` ≠ live API на эмуляторе.",
        "- **05-scroll-top** — диалог каналов + кнопка «Вверх» (как в scan).",
        "",
    ]

    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nReport: {REPORT}")


if __name__ == "__main__":
    main()
