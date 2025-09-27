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
 * Returns a table from a supplied Google Doc url
 *
 * @param {string} sheetUrl - The full url to the google sheet
 * @param {string} tableNumber
 * @param {string}
 * @returns {table}
 */
function getGoogleDocTable(doc, tableNumber = 0, tabName = null) {
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
