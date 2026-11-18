## Version 1.1.0
- Converts every px/rem value in a selection, including shorthand like `margin: 0 16px`.
- Keeps negative signs (`-16px` → `-1rem`).
- Works with the cursor on a value, no selection needed, including after a trailing `;`, `)` or `!important`.
- New **PX ⇄ REM (Current Line)** command (`shift-ctrl-x`) toggles every value on the current line.
- New **PX → REM → EM** (`opt-ctrl-x`) and **PX → REM → EM (Current Line)** (`opt-shift-ctrl-x`) commands cycle values through px, rem and em.
- No longer errors on selections without a px/rem value, or on uppercase units.
- Keeps the converted text selected, including with multiple cursors.
- New setting for the base font size (default 16px).
- Rounds results to 4 decimal places.
- Added LESS, Svelte and HTML support.

## Version 1.0.2
Added support for Vue files.

## Version 1.0.1
I'm still learning how to submit an extension.

## Version 1.0

Initial release
