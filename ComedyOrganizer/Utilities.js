var commonNames = {
	// Name
	bitName: "Bit",

	// Project
	projectColumnName: "Project",
	projectCell: "Project:",
	projectNamedRange: "Projects",

	// Quality
	qualityColumn: "Quality",
	qualityNamedRange: "Qualities",
	bestQuality: "Highest Quality",
	worstQuality: "Lowest Quality",

	//Step
	stepColumn: "Current Step",
	stepNamedRange: "Steps",
	bestStep: "Earliest Step",
	worstStep: "Latest Step",

	// Links
	linkColumn: "Links w/",
	linkNamedRange: "Bits",

	// Topics
	topicColumn: "Topics",
	topicNamedRange: "Topics",

	// Tech Used
	techColumn: "Techniques Used",
	techNamedRange: "Techniques",

	// Performances
	performanceColumn: "Performances",
	performanceNamedRange: "Performances",

	// Current
	currentColumn: "Current",
};

var operatorStrings = {
	best: "Best",
	worst: "Worst",
};

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

/**
 *
 * @param {Sheet} sheet
 * @param {string} targetValue
 * @param {number} rowNumber
 * @returns
 */
function getRichTextToRightOfValue(sheet, targetValue, rowNumber) {
	const dataRange = sheet.getDataRange();
	const values = dataRange.getValues();
	const richTexts = dataRange.getRichTextValues();

	for (let col = 0; col < values[rowNumber].length - 1; col++) {
		if (values[rowNumber - 1][col] === targetValue) {
			const richTextRight = richTexts[rowNumber][col + 1];
			Logger.log("Text: " + richTextRight.getText());
			Logger.log("Link: " + richTextRight.getLinkUrl());
			Logger.log("Style: " + JSON.stringify(richTextRight.getTextStyle()));
			return richTextRight;
		}
	}

	Logger.log("Value not found.");
	return null;
}

function sortSheets() {
	var sheetNameArray = [];
	var sheets = ss.getSheets();

	for (var i = 0; i < sheets.length; i++) {
		sheetNameArray.push(sheets[i].getName());
	}

	sheetNameArray.sort();

	for (var j = 0; j < sheets.length; j++) {
		ss.setActiveSheet(ss.getSheetByName(sheetNameArray[j]));
		ss.moveActiveSheet(j + 1);
	}
}

function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

/**
 *
 * @param {Sheet} sheet
 * @returns
 */
function getHeaderMap(sheet) {
	if (
		sheet == null ||
		sheet.getLastColumn() == 0 ||
		sheet.getRange(1, 1, 1, sheet.getLastColumn()) == undefined
	)
		return {};

	var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	var headerMap = {};
	headers.forEach((header, index) => {
		headerMap[header] = index + 1; // Column numbers start at 1
	});

	return headerMap;
}

function isDropdown(cell) {
	Organizer.assertSingleCell(cell);
	const rule = cell.getDataValidation();
	var val = cell.getValue();
	if (!rule) return false;

	const criteria = rule.getCriteriaType();
	return (
		criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST ||
		criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE
	);
}

function getRangeFromColumn(sheet, columnName) {
	var headerMap = getHeaderMap(sheet);
	var columnNumber = headerMap[columnName];
	if (columnNumber == undefined) return null;

	var lastRow = getLastDropdown(sheet, columnName);

	return sheet.getRange(2, columnNumber, lastRow, 1);
}

function getLastDropdown(sheet, columnName) {
	var headerMap = getHeaderMap(sheet);
	var columnNumber = headerMap[columnName];
	if (columnNumber == undefined) return 0;

	const lastRow = sheet.getLastRow();
	let lastDropdownRow = 0;

	for (let row = 1; row <= lastRow; row++) {
		const cell = sheet.getRange(row, columnNumber);
		if (isDropdown(cell)) {
			lastDropdownRow = row;
		}
	}
	return lastDropdownRow + 1;
}
