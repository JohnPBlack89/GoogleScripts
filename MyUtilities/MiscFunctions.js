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

/***
 * Sorts the 
 */
function sortSheetsAlphabetically(spreadsheet = SpreadsheetApp.getActiveSpreadsheet()) {
  console.log("Starting: sortSheetsAlphabetically")
  const sheets = spreadsheet.getSheets();
  
  const sheetNames = sheets.map(sheet => sheet.getName());
  const sortedSheetNames = sheetNames.slice().sort();

  // Compare current order to sorted order
  let needsSorting = false;
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== sortedSheetNames[i]) {
      needsSorting = true;
      break;
    }
  }

  if (!needsSorting) {
    Logger.log("Sheets are already in alphabetical order. No reordering performed.");
    return;
  }
  
  // Reorganize Sheets
  for (let i = 0; i < sortedSheetNames.length; i++) {
    const sheet = spreadsheet.getSheetByName(sortedSheetNames[i]);
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(i + 1);
  }

  Logger.log("Sheets have been sorted alphabetically.");
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