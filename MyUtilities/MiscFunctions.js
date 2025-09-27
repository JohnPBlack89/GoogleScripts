/**
 * Retrieves a Sheet object based on its GiD.
 *
 * @param {string} gid The full gid of the Google Sheet.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null} The Sheet object if found, otherwise null.
 */
function getSheetNameByGid(spreadsheet, gid) {
	gid = Number(gid); // Ensure it's a number
	var sheets = spreadsheet.getSheets();
	for (var i = 0; i < sheets.length; i++) {
		if (sheets[i].getSheetId() === gid) {
			return sheets[i].getName(); // Return the sheet name
		}
	}
	return null; // Not found
}


function columnToLetter(column) {
	let letter = "";
	while (column > 0) {
		const temp = (column - 1) % 26;
		letter = String.fromCharCode(temp + 65) + letter;
		column = Math.floor((column - temp - 1) / 26);
	}
	return letter;
}

/**
 * Sorts the sheets in the spreadsheet alphabetically
 */
function sortSheetsAlphabetically(spreadsheet) {
	var sheetNameArray = [];
	var sheets = spreadsheet.getSheets();

	for (var i = 0; i < sheets.length; i++) {
		sheetNameArray.push(sheets[i].getName());
	}

	sheetNameArray.sort();

	for (var j = 0; j < sheets.length; j++) {
		spreadsheet.setActiveSheet(spreadsheet.getSheetByName(sheetNameArray[j]));
		spreadsheet.moveActiveSheet(j + 1);
	}
}

/**
 * Determines whether or not the cell is a dropdown
 */
function isDropdown(cell) {
	assertSingleCell(cell);
	const rule = cell.getDataValidation();
	var val = cell.getValue();
	if (!rule) return false;

	const criteria = rule.getCriteriaType();
	return (
		criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST ||
		criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE
	);
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