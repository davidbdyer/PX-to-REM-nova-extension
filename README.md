# PX-to-REM Extension for Nova

**PX to REM** toggles CSS units between `px` and `rem`, or cycles them through `px`, `rem` and `em`, in CSS, SCSS, Sass, LESS, Vue, Svelte and HTML files.

## Commands

| Command | Shortcut | What it does |
| --- | --- | --- |
| **PX ⇄ REM** | `ctrl-x` | Toggles px ⇄ rem in the selection, or the value at the cursor |
| **PX ⇄ REM (Current Line)** | `shift-ctrl-x` | Toggles px ⇄ rem for every value on the current line |
| **PX → REM → EM** | `opt-ctrl-x` | Cycles px → rem → em → px in the selection, or the value at the cursor |
| **PX → REM → EM (Current Line)** | `opt-shift-ctrl-x` | Cycles every value on the current line one step |

Run them with the shortcut, from the Editor menu or the contextual menu, or from the command palette.

Without Option, each `px` value becomes `rem` and each `rem` value becomes `px`; `em` is left alone. Holding Option cycles each value one step instead: `24px` → `1.5rem` → `1.5em` → `24px`. Press it again to keep cycling. Other units such as `%` and `vh` are never changed.

| Before | Command | After |
| --- | --- | --- |
| `16px` | PX ⇄ REM | `1rem` |
| `padding: 8px 1rem 0 -4px;` | PX ⇄ REM (Current Line) | `padding: 0.5rem 16px 0 -0.25rem;` |
| `font-size: 1.5rem;` | PX → REM → EM | `font-size: 1.5em;` |
| `margin: 8px 1rem 2em;` | PX → REM → EM (Current Line) | `margin: 0.5rem 1em 32px;` |

With no selection, the cursor can be anywhere in a value or just after it, even after a trailing `;`, `)` or `!important`. The line commands keep the cursor where it was. Multiple selections and cursors are supported.

## Settings

**Base Font Size (px)**: the font size used for conversion (default `16`), so `1rem` and `1em` equal this many pixels. Set it in **Extensions → Extension Library → PX to REM → Settings**.

`em` is relative to the parent element's font size, so `em` values are only accurate where that matches the base font size.
