// Matches a number followed by a px, rem or em unit, e.g. "16px", "-0.5rem", ".75EM".
const VALUE_PATTERN = /(-?(?:\d+\.?\d*|\.\d+))(px|rem|em)\b/gi;
const DEFAULT_BASE = 16;

// Characters allowed between the end of a value and the cursor,
// so "20px;|", "20px);|" or "20px !important;|" still finds the value.
const TRAILING = /^[\s;,)}]*(?:!important[\s;,)}]*)?$/i;

function getBaseSize() {
	const base = Number(nova.config.get('pxtorem.baseFontSize'));
	return base > 0 ? base : DEFAULT_BASE;
}

function round(value) {
	return parseFloat(value.toFixed(4));
}

// Returns the converted value, or null if this unit isn't part of the mode.
// mode 'toggle': px ⇄ rem, em is left alone.
// mode 'cycle':  px → rem → em → px (rem and em share the base size).
function convert(number, unit, base, mode) {
	const value = parseFloat(number);
	unit = unit.toLowerCase();
	if (unit === 'px') return `${round(value / base)}rem`;
	if (unit === 'rem') return mode === 'cycle' ? `${round(value)}em` : `${round(value * base)}px`;
	if (unit === 'em' && mode === 'cycle') return `${round(value * base)}px`;
	return null;
}

function convertText(text, base, mode) {
	return text.replace(VALUE_PATTERN, (whole, number, unit) =>
		convert(number, unit, base, mode) ?? whole);
}

function isConvertible(match, mode) {
	return convert(match[1], match[2], DEFAULT_BASE, mode) !== null;
}

// With an empty selection, find the value under or just before the cursor.
function rangeAtCursor(editor, position, mode) {
	const lineRange = editor.getLineRangeForRange(new Range(position, position));
	const line = editor.getTextInRange(lineRange);
	const offset = position - lineRange.start;

	let found = null;
	for (const match of line.matchAll(VALUE_PATTERN)) {
		const start = match.index;
		const end = start + match[0].length;
		if (start > offset) break;
		if (!isConvertible(match, mode)) continue;
		if (offset <= end || TRAILING.test(line.slice(end, offset))) {
			found = new Range(lineRange.start + start, lineRange.start + end);
		}
	}
	return found;
}

// Where an offset in a line ends up after the line is converted.
// An offset inside a converted value moves to the end of the new value.
function mapOffset(text, offset, base, mode) {
	let shift = 0;
	for (const match of text.matchAll(VALUE_PATTERN)) {
		const start = match.index;
		const end = start + match[0].length;
		if (start >= offset) break;
		const converted = convert(match[1], match[2], base, mode);
		if (converted === null) continue;
		if (end > offset) return start + shift + converted.length;
		shift += converted.length - match[0].length;
	}
	return offset + shift;
}

// Sorts changes, drops overlaps (e.g. two cursors on the same value or line)
// and applies them. Resolves with the changes applied, or null if none.
function applyChanges(editor, changes) {
	changes.sort((a, b) => a.range.start - b.range.start);
	for (let i = changes.length - 1; i > 0; i--) {
		if (changes[i].range.start < changes[i - 1].range.end) changes.splice(i, 1);
	}
	if (changes.length === 0) return Promise.resolve(null);

	// Apply from the end of the document so earlier offsets stay valid.
	return editor.edit((e) => {
		for (let i = changes.length - 1; i >= 0; i--) {
			e.replace(changes[i].range, changes[i].replacement);
		}
	}).then(() => changes);
}

// Toggles the selected values, or the value at each cursor.
function convertSelection(editor, mode) {
	const base = getBaseSize();

	const changes = [];
	for (const selected of editor.selectedRanges) {
		const range = selected.empty ? rangeAtCursor(editor, selected.start, mode) : selected;
		if (!range) continue;

		const text = editor.getTextInRange(range);
		const replacement = convertText(text, base, mode);
		if (replacement !== text) {
			changes.push({ range, replacement });
		}
	}

	return applyChanges(editor, changes).then((applied) => {
		if (!applied) return;
		// Re-select the converted text, accounting for length changes.
		let shift = 0;
		editor.selectedRanges = applied.map(({ range, replacement }) => {
			const start = range.start + shift;
			shift += replacement.length - range.length;
			return new Range(start, start + replacement.length);
		});
	});
}

// Toggles every value on each line that has a cursor or selection.
function convertLines(editor, mode) {
	const base = getBaseSize();
	const original = editor.selectedRanges;

	const changes = [];
	for (const selected of original) {
		const range = editor.getLineRangeForRange(selected);
		const text = editor.getTextInRange(range);
		const replacement = convertText(text, base, mode);
		if (replacement !== text) {
			changes.push({ range, text, replacement });
		}
	}

	return applyChanges(editor, changes).then((applied) => {
		if (!applied) return;
		// Keep each cursor next to the same text it was next to before.
		const move = (pos) => {
			let shift = 0;
			for (const { range, text, replacement } of applied) {
				if (range.end <= pos) {
					shift += replacement.length - range.length;
				} else if (range.start <= pos) {
					return range.start + shift + mapOffset(text, pos - range.start, base, mode);
				}
			}
			return pos + shift;
		};
		editor.selectedRanges = original.map((r) => new Range(move(r.start), move(r.end)));
	});
}

nova.commands.register('px-to-rem', (editor) => convertSelection(editor, 'toggle'));
nova.commands.register('px-to-rem-line', (editor) => convertLines(editor, 'toggle'));
nova.commands.register('px-rem-em-cycle', (editor) => convertSelection(editor, 'cycle'));
nova.commands.register('px-rem-em-cycle-line', (editor) => convertLines(editor, 'cycle'));
