class BitList extends Organizer.TableContext {
  constructor(sheetName, spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(sheetName, spreadsheet, titleRowNumber);
	}

  
	/**
	 * Checks whether or not this bit has been updated in the bitList sheet
	 *
	 * @returns true|false
	 */
	isUpdated(bitName) {
    
	}

	/***
	 * Finds which row the bit is at on the bitListSheet
	 *
	 * @returns {number}
	 */
	getBitListRowNumber() {
		if (this.bitListRowNumberCache != null) return this.bitListRowNumberCache;

		var lastRow = bitListSheet.getLastRow();
		var rowValues = bitListSheet.getRange(1, 1, lastRow, 1).getValues();

		for (let i = 0; i < rowValues.length; i++) {
			if (rowValues[i][0] == this.name) {
				this.bitListRowNumberCache = i + 1;
				return this.bitListRowNumberCache;
			}
		}
		return null;
	}

	get bitListRowNumber() {
		return this.getBitListRowNumber();
	}

	getBitRowDetails() {
		var row = [];
		var headerMap = getHeaderMap(bitListSheet);
		for (var header in headerMap) row.push(getBitColumnRouter(sheet, header));

		return row;
	}

  getCheckboxValue(rowHeader, colHeader) {
		Logger.log(`Start getCheckboxValue of ${colHeader} for ${rowHeader}`);
		const data = bitListSheet.getDataRange().getValues();

		// Find row index based on first column
		const rowIndex = data.findIndex((row) => row[0] === rowHeader);
		if (rowIndex === -1)
			return SpreadsheetApp.newRichTextValue().setText("").build();

		// Find column index based on first row
		const colIndex = data[0].indexOf(colHeader);
		if (colIndex === -1) throw new Error("Column header not found");

		// Get the checkbox value
		const cellValue = data[rowIndex][colIndex];
		Logger.log(`Checkbox value at (${rowHeader}, ${colHeader}): ${cellValue}`);
		return SpreadsheetApp.newRichTextValue().setText(cellValue).build();
	}
}
