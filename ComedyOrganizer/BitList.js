class BitList extends MyUtilities.TableContext {
  constructor(spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(sheetName, spreadsheet, titleRowNumber);

    this.list = {};
	}

  update() {
    // Sort Sheets

    // get sheet names (now in order)

    // For each sheet name check if it's on the list
        // if it is check if it's been updated already
        // if not insert row

    // Get row data and add row
  }
  
  createBit(bitName) {
    if (!isBit(bitName)) return null;
    this.list[bitName] = new Bit(bitName);
    return this.list[bitName];
  }

  /**
   * Runs over every sheet and compares the contents in them vs the contents on the Bit List sheet
   */
  checkBitListRows() {
    var sheets = ss.getSheets();

    sheets.forEach(function (sheet) {
      if (!isBit(sheet.getName())) return;

      var row = new BitRow(sheet);

      if (!row.isUpdated()) return;

      // range.setRichTextValues(summaryData);
    });
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
	getRowNumber(bit) {

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
	 */

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
