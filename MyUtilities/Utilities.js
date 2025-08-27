/**
 * Gets the URL of a hyperlink from a specified cell
 *
 * @param {string} sheetName The name of the sheet (e.g., "Sheet1").
 * @param {string} cellReference The A1 notation of the cell (e.g., "A1", "B5").
 * @returns {string|null} The URL of the hyperlink, or null if no hyperlink is found.
 */
function getURLHyperlinkFromCell(sheetName, columnNumber, rowNumber) {
	try {
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		const sheet = spreadsheet.getSheetByName(sheetName);

		if (!sheet) {
			console.error(`Error: Sheet '${sheetName}' not found.`);
			return null;
		}

		const range = sheet.getRange(rowNumber, columnNumber);
		const richTextValue = range.getRichTextValue();

		if (richTextValue) {
			// Get the URL from the first text segment (assuming the whole cell is one hyperlink)
			const url = richTextValue.getLinkUrl();
			if (url) {
				return url;
			}
		}

		console.log(`No hyperlink found in cell on sheet ${sheetName}.`);
		return null;
	} catch (e) {
		console.error(`An error occurred: ${e.message}`);
		return null;
	}
}

/** Generates a Task Id */
function createGuid() {
	return Utilities.getUuid();
}


/**
 * Get the gid to a google sheet from a url
 * 
 * @param {string} url
 * @returns {string} The gid of the google sheet
 */
function extractSheetId(url) {
  if (url.startsWith("#gid="))
      return url.slice(5);
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)\//);
  return match ? match[1] : null;
}

/**
 * Checks if a given URL is a reference to any Google Sheet document
 *
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL is a Google Sheet reference, false otherwise.
 */
function isGoogleSheetReference(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	// Regular expression to match Google Sheets URLs (aka "https://docs.google.com/spreadsheets/d/)
	const googleSheetRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\//;

	try {
		return googleSheetRegex.test(url);
	} catch (e) {
		console.error(`Error checking Google Sheet reference: ${e.message}`);
		return false;
	}
}

/**
 * Checks if a given URL is a reference to any Google Doc document
 *
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL is a Google Doc reference, false otherwise.
 */
function isGoogleDocReference(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	const googleDocRegex = /^https:\/\/docs\.google\.com\/document\/d\//;

	try {
		return googleDocRegex.test(url);
	} catch (e) {
		console.error(`Error checking Google Doc reference: ${e.message}`);
		return false;
	}
}

/**
 * Retrieves a Sheet object based on its URL.
 * This function can open a spreadsheet and, if a GID is present in the URL,
 * it will also attempt to return the specific sheet within that spreadsheet.
 *
 * @param {string} sheetUrl The full URL of the Google Sheet or a specific sheet within it.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} The Sheet object if found, otherwise null.
 */
function getSheetFromUrl(sheetUrl) {
	if (!isGoogleSheetReference(sheetUrl)) {
		console.error(
			`Error: The provided URL '${sheetUrl}' is not a valid Google Sheet URL.`
		);
		return null;
	}

	try {
		// Extract spreadsheet ID from the URL
		const spreadsheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (!spreadsheetIdMatch || spreadsheetIdMatch.length < 2) {
			console.error(
				`Error: Could not extract spreadsheet ID from URL: ${sheetUrl}`
			);
			return null;
		}
		const spreadsheetId = spreadsheetIdMatch[1];

		// Open the spreadsheet
		const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
		if (!spreadsheet) {
			console.error(
				`Error: Could not open spreadsheet with ID: ${spreadsheetId}`
			);
			return null;
		}

		// Extract GID (sheet ID) from the URL if present
		const gidMatch = sheetUrl.match(/#gid=([0-9]+)/);
		if (gidMatch && gidMatch.length >= 2) {
			const gid = parseInt(gidMatch[1], 10);
			const sheet = spreadsheet.getSheetById(gid);
			if (!sheet) {
				console.warn(
					`Warning: Sheet with GID '${gid}' not found in spreadsheet '${spreadsheet.getName()}'. Returning the first sheet.`
				);
				return spreadsheet.getSheets()[0]; // Fallback to the first sheet
			}
			return sheet;
		} else {
			// If no GID is specified, return the first sheet in the spreadsheet
			return spreadsheet.getSheets()[0];
		}
	} catch (e) {
		console.error(
			`An error occurred while getting sheet from URL: ${e.message}`
		);
		return null;
	}
}

/**
 * Retrieves a Spreadsheet object based on its URL.
 *
 * @param {string} sheetUrl The full URL of the Google Sheet.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null} The Spreadsheet object if found, otherwise null.
 */
function getSpreadsheetFromUrl(sheetUrl) {
	if (!isGoogleSheetReference(sheetUrl)) {
		console.error(
			`Error: The provided URL '${sheetUrl}' is not a valid Google Sheet URL.`
		);
		return null;
	}

	try {
		const spreadsheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (!spreadsheetIdMatch || spreadsheetIdMatch.length < 2) {
			console.error(
				`Error: Could not extract spreadsheet ID from URL: ${sheetUrl}`
			);
			return null;
		}

		const spreadsheetId = spreadsheetIdMatch[1];
		const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

		if (!spreadsheet) {
			console.error(
				`Error: Could not open spreadsheet with ID: ${spreadsheetId}`
			);
			return null;
		}

		return spreadsheet;
	} catch (e) {
		console.error(
			`An error occurred while getting spreadsheet from URL: ${e.message}`
		);
		return null;
	}
}

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

/**
 * Moves the value from one cell to another
 *
 * @param {Sheet} exportSheet The sheet to take values from
 * @param {number} exportRow The row to take values from
 * @param {number} exportColumn The row to take values from
 * @param {Sheet} importSheet The sheet to give values to
 * @param {number} importRow The row to give values to
 * @param {number} importColumn The row to give values to
 */
function migrateCell(
	exportSheet,
	exportColumn,
	exportRow,
	importSheet,
	importColumn,
	importRow
) {
	if (
		!(exportSheet instanceof SheetContext) ||
		!(importSheet instanceof SheetContext)
	)
		throw new Error("Must pass SheetContext objects to function");
	var migrationValue = exportSheet.getRange(exportRow, exportColumn).getValue();
	importSheet.getRange(importRow, importColumn).setValue(migrationValue);
}

/**
 * Returns the whole number value of a date, when passed a date value (in milliseconds)
 *
 * @param {number} date A date given in milliseconds
 * @returns {number} day The whole number value of a day
 */
function getDateAsNumber(date) {
	return Math.trunc(date / (1000 * 60 * 60 * 24));
}

/**
 * Returns T/F whether a given string is the name of a weekend
 *
 * @param {string} day The name of a day
 * @returns {True|False}
 */
function isWeekend(day) {
	return day == "Saturday" || day == "Sunday";
}

/**
 * 
 */
function daysUntilDate(date) {
  if(!date) {
    Logger.log("Task has no due date");
    return;
  }

  return getDaysBetween(new Date(), date);
}

/**
 * Returns a table from a supplied Google Doc url
 *
 * @param {string} sheetUrl - The full url to the google sheet
 * @param {string} tableNumber
 * @param {string}
 * @returns {table}
 */
function getGoogleDocTable(sheetUrl, tableNumber = 0, tabName = null) {
	var doc = DocumentApp.openByUrl(sheetUrl);

	for (const tab of doc.getTabs()) {
		if (tabName == null) break;

		const tabBody = tab.asDocumentTab().getBody();
		const text = tabBody.getText();
		if (text.includes(tabName)) {
			doc = tab;
			break;
		}
	}

	const tables = doc.getBody().getTables();

	if (tables.length === 0) {
		Logger.log("No tables found in the document.");
		return;
	}

	return tables[tableNumber];
}

/***
 * Blends two colors together
 *
 * @param {string} hex1 - color as a hex
 * @param {string} hex3 - color as a hex
 */
function blendHexColors(hex1, hex2) {
	// Helper to convert hex to RGB
	function hexToRgb(hex) {
		const cleanHex = hex.replace("#", "");
		return {
			r: parseInt(cleanHex.substring(0, 2), 16),
			g: parseInt(cleanHex.substring(2, 4), 16),
			b: parseInt(cleanHex.substring(4, 6), 16),
		};
	}

	function rgbToHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}

	const rgb1 = hexToRgb(hex1);
	const rgb2 = hexToRgb(hex2);

	const blended = {
		r: Math.round((rgb1.r + rgb2.r) / 2),
		g: Math.round((rgb1.g + rgb2.g) / 2),
		b: Math.round((rgb1.b + rgb2.b) / 2),
	};

	return rgbToHex(blended.r, blended.g, blended.b);
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

function getHeaderKeyByValue(headerMap, targetValue) {
  return Object.keys(headerMap).find(key => headerMap[key] === targetValue);
}

/**
 * 
 */
function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;

  const diffInMs = end - start;
  const diffInDays = Math.round(diffInMs / msPerDay);

  return diffInDays;
}

/**
 * 
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