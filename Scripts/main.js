function convertToRem(value) {
	const remValue = value / 16;
	return `${remValue}rem`;
}

function convertToPx(value) {
	const pxValue = value * 16;
	return `${pxValue}px`;
}

function detectFirstChar(selection, char) {
	const matched = selection.slice(0, 2).match(char);
	if (matched != null) {
		return true;
	}
}

function format() {

}

function detectLastChar(selection, char) {
	const matched = selection.slice(-1).match(char);
	if (matched != null) {
		return true;
	}
}

nova.commands.register('px-to-rem', (editor) => {
	// Get selection
	const selectedRanges = editor.selectedRanges.reverse();

	editor.edit(function(e) {
		// Go through all selected values
		for (let range of selectedRanges) {
			let { start, end } = range;

			let selection = editor.getTextInRange(range);
			console.log(range, selection);

			if (detectFirstChar(selection, /^[a-z:]/)) {
				start = start + 1;
			}

			if (detectFirstChar(selection, /^[a-z:]\s/)) {
				start = start + 1;
			}

			if (detectFirstChar(selection, /^\s/)) {
				start = start + 1;
			}

			if (detectLastChar(selection, /[;)]/)) {
				end = end - 1;
			}

			range = new Range(start, end);
			selection = editor.getTextInRange(range);
			console.log(range, selection);

			// Split unit and value and assign to variables
			const value = selection.match(/[0-9.]/g).join('');
			const unit = selection.match(/[a-z]/g).join('');


			if (unit === 'px') {
				const rem = convertToRem(value);
				e.replace(range, rem);
				editor.addSelectionForRange(range);
			} else if (unit === 'rem') {
				const px = convertToPx(value);
				e.replace(range, px);
				editor.addSelectionForRange(range);
			}
		}
	});
});