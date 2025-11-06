var emptyRichText = MyUtilities.emptyRichText;
var ss = SpreadsheetApp.getActiveSpreadsheet();


function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

function midnightRun() {
  console.log("Midnight Run Started");
  MyUtilities.sortSheetsAlphabetically();
  var bitList = new BitList(2);
  bitList.update();
  // Headers Problems
}

/**
 * Validates that the provided parameter is a Spreadsheet object.
 *
 * @param {Spreadsheet} spreadsheet - The Spreadsheet object to validate.
 * @throws {Error} If the spreadsheet is not a Spreadsheet.
 */
function assertSheet(sheet){
  if (Object.prototype.toString.call(sheet) === "[object Sheet]")
			throw new Error(
				"Must pass a Sheet object to function"
			);
}

/**
 * Gets the complete RichTextValue for any of its contents that
 * match what's in a given named range
 *
 * @param {Range} cell
 * @param {string} namedRangeName
 * @returns {RichTextValue}
 */
function getNamedRangeHyperlinks(text, namedRangeName, spreadsheet = SpreadsheetApp.getActiveSpreadsheet()) {
	var richText;

	var textOptions = text.replaceAll(", ", ",").split(",");
	if (!textOptions | (textOptions[0] == "")) return emptyRichText;

	// Get values from named range to compare against
	var namedRange = spreadsheet.getRangeByName(namedRangeName);
	var namedRangeValues = namedRange.getValues().flat();

	for (let i = 0; i < textOptions.length; i++) {
    var cellSelection = textOptions[i];
    if(cellSelection == null || cellSelection == undefined || cellSelection == "")
      continue;

    var index = namedRangeValues.indexOf(cellSelection);
    var rangeCell = namedRange.getCell(index + 1, 1);
    richText = addNamedRangeHyperlink(rangeCell, richText);
    continue;
	}

	return richText;
}

/**
 * Adds a hyperlink to a url on to an already existing RichTextValue
 *
 * @param {Range} namedRangeCell
 * @param {RichTextValue} sourceRichTextValue
 * @returns {RichTextValue}
 */
function addNamedRangeHyperlink(namedRangeCell, currentRichTextValue) {
	assertSingleCell(namedRangeCell);

	var newText = namedRangeCell.getValue();
	var linkUrl = namedRangeCell.getRichTextValue().getLinkUrl();
	var linkStart;
	var linkText;
	var newRichTextValue = SpreadsheetApp.newRichTextValue();

	if (currentRichTextValue == undefined) {
		currentRichTextValue = SpreadsheetApp.newRichTextValue();
		linkText = newText;
		linkStart = 0;
		newRichTextValue.setText(linkText);
	} else {
		var oldTextLength = currentRichTextValue.getText().length;
		linkText = currentRichTextValue.getText() + ", " + newText;
		linkStart = oldTextLength + 2;
		newRichTextValue = addHyperlink(
			currentRichTextValue,
			linkText
		);
	}

	return newRichTextValue
		.setLinkUrl(linkStart, linkText.length, linkUrl)
		.build();
}

/**
 * Adds a hyperlink on to an already existing RichTextValue
 *
 * @param {RichTextValue} originalRichTextValue
 * @param {string} linkText
 * @returns
 */
function addHyperlink(originalRichTextValue, linkText) {
	var runs = originalRichTextValue.getRuns();
	const builder = SpreadsheetApp.newRichTextValue().setText(linkText);

	runs.forEach((run) => {
		const url = run.getLinkUrl();
		if (url) {
			const start = run.getStartIndex();
			const end = run.getEndIndex();
			builder.setLinkUrl(start, end, url);
		}
	});

	return builder;
}