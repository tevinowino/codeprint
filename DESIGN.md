# Design

<!-- impeccable:design-schema 1 -->

## Direction

Neutrals (zinc) plus one committed accent color, lime, carried by primary actions and the "done" status — not a full saturated palette. Light is the default theme; dark is a fully supported, equally designed alternate, not an afterthought. The direction was pinned by the user with a reference image (a white-ground, black-outlined agency site) rather than explored from scratch; CODEPRINT translated its palette and card language rather than copying its layout, content, or illustration style.

## Palette

| Role | Light | Dark |
|---|---|---|
| Background | zinc-50 | zinc-950 |
| Card | white | zinc-900 |
| Foreground | zinc-950 | zinc-100 |
| Muted foreground | zinc-500 | zinc-400 |
| Primary (accent) | lime-400 `#A3E635` | lime-400 (same) |
| Primary foreground | zinc-950 (black text on lime) | zinc-950 (same) |
| Ordinary border (hairlines, dividers) | zinc-200 | zinc-800 |
| Ring (focus) | lime-400 | lime-400 |

Lime is used for: primary buttons/CTAs, the "completed" status dot, the selected chip in `ScopingFormCard`, the workspace tab bar's sliding indicator (`liquid-gooey`'s `fill`, wired to `var(--primary)` so it always matches), and focus rings. It is **not** used as arbitrary text color — lime-400 has poor contrast as foreground text on light backgrounds, so it never appears as `text-*`, only as a fill with black text on top.

## Card border convention (deliberate, separate from the `border` token)

Actual card containers (`ProjectCard`, `ScopingFormCard`, `DocumentPreviewCard`, `NoteCard`, the brand mark boxes) use an explicit `border-2 border-zinc-900 dark:border-zinc-100` — a bold, thick, black-in-light/white-in-dark frame. This is **not** the ambient `--border` token (which stays a soft zinc-200/zinc-800 hairline for ordinary dividers — nav bars, tab rows, toolbar rules). The reference itself has a clean, borderless top nav and reserves the thick border for cards; mapping "bold border" onto the global `--border` token would have made every hairline in the app thick and black, which the reference doesn't do.

## Shape

- `--radius` base is `1rem` (bumped from the previous `0.5rem`); every `rounded-lg`/`rounded-xl`/etc. utility derives from it via the existing `@theme inline` mapping, so the radius bump alone gave the whole app friendlier rounding.
- Primary/default buttons are `rounded-full` (a real pill) — the one explicit shape override, layered on top of the radius bump.
- Card radius stays at the token scale (`rounded-xl`/`rounded-2xl`), not pill-shaped.

## Status color mapping

`StatusBadge` (`src/components/status-badge.tsx`) moved off the prior amber/blue/emerald three-color scheme to fit the new restrained-plus-lime palette: `interviewing` = zinc-400 (neutral/early), `architecting` = zinc-900/zinc-100 (mid, black-or-white per theme), `completed` = lime (brand pop, "done").

## Theming mechanism

`next-themes` (`attribute="class"`, `defaultTheme="light"`, `enableSystem={false}` — a plain two-way toggle, not OS-following). `ThemeToggle` (`src/components/theme-toggle.tsx`) lives in the sidebar footer and the landing page header nav. Components that can't consume CSS custom properties directly (`GooeyToaster`, `ThinkingOrb`) read `resolvedTheme` from `useTheme()` and pass an explicit `"light" | "dark"` prop rather than relying on their own `"auto"` ancestor-class detection, to avoid any mismatch with next-themes' actual class behavior.

## What stays untouched

The overall layout, component structure, and interaction patterns (workspace tab bar, chat, document tabs, tracker, notes) are unchanged — this was a token/color/shape pass, not a structural redesign. `ProductPreview`'s floating mockup cards keep the shadow-only elevation convention (no border) established earlier this session, rather than picking up the bold-border convention — they're a "floating screenshot," not an in-app card.
