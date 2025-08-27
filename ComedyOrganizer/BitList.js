class BitList extends MyUtilities.TableContext {
  constructor(spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(bitListSheetName, spreadsheet, titleRowNumber);
	}

  update() {
    // Sort Sheets
    MyUtilities.sortSheetsAlphabetically(this.spreadsheet)

    // get sheet names (now in order)
    this.getBitNames();

    var rowValues = this.bitValues;

    // For each sheet name check if it's on the list
    for(let i = 0; i <= this.bitNames.length; i++) {
      let bitName = this.bitNames[i];
      let rowName = rowValues[i][0];
      let rowNumber = i + this.titleRowNumber;

      if(!rowValues.includes(bitName))
        this.sheet.insertRowAfter(rowNumber++);
      else if(bitName != rowName)
        rowNumber = rowValues.indexOf(bitName) + this.titleRowNumber;
      
      // If bit has been updated continue
      if(this.isUpdated(bitName))
        continue;
      
      let bitRow = this.getBitRowDetails(bitName);

      this.setRowValues(bitRow, rowNumber);
    }
  }

  getBitNames() {
    this.bitNames = [];
	  var sheets = this.spreadsheet.getSheets();
    var sheetName;

    for (var i = 0; i < sheets.length; i++) {
      var sheetName = sheets[i].getName();
      
      if(!isBit(sheetName))
        continue;

      this.bitNames.push(sheets[i].getName());
    }

    this.bitNames.sort();
  }
  
  createBit(bitName) {
    if (!isBit(bitName)) return null;
    this.list[bitName] = new Bit(bitName);
    return this.list[bitName];
  }

  findRowNumber(bitName) {

  }
  
	/**
	 * Checks whether or not this bit has been updated in the bitList sheet
	 *
	 * @returns true|false
	 */
	isUpdated(bitName) {
    throw Error("isUpdated not implemented yet");
	}

	getBitRowDetails(bitName) {
    throw Error("getBitRowDetails not implemented yet");
    /*
		var row = [];
		var headerMap = getHeaderMap(bitListSheet);
		for (var header in headerMap) row.push(getBitColumnRouter(sheet, header));

		return row;
    */
	}

  setRowValues(bitRowDetails, rowNumber) {
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
