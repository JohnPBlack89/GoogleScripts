const nameColumnName = "Bit";
var bitListSheetName = ".Bit List";
var commonColumnNameSets = commonColumnNameSets;
commonColumnNameSets.name.push(nameColumnName);

class BitList extends TableContext{
  constructor(spreadsheet, range, titleRow = 1) {
    super(range, titleRow);
    this.spreadsheet = spreadsheet;
    this.values = range.getValues();
	}

  update() {
    // For each sheet name check if it's on the list
    for(let i = 0; i < this.bitSheetNames.length; i++) {
      let bitName = this.bitSheetNames[i];
      
      // If bit has been updated continue
      //if(this.isUpdated(bitName))
      this.isUpdated(bitName);
      return;
      
      //let bitRow = this.getBitRowDetails(bitName);

      //this.setRowValues(bitRow, rowNumber);
    }
  }

  /***
   * Returns all of the names of all of the sheets that return true for the isBit() function
   */ 
  getBitSheetNames() {
    if(this.bitSheetNamesCache) return this.bitSheetNamesCache;

    this.bitSheetNamesCache = [];
	  var sheets = this.spreadsheet.getSheets();
    var sheetName;

    for (var i = 0; i < sheets.length; i++) {
      var sheetName = sheets[i].getName();
      
      if(!isBit(sheetName))
        continue;

      this.bitSheetNamesCache.push(sheets[i].getName());
    }

    this.bitSheetNamesCache.sort();

    return this.bitSheetNamesCache;
  }

  get bitSheetNames() {
    return this.getBitSheetNames();
  }

  /***
   * Returns all of the names of the bits on the bit list sheet
   */
  getBitListNames() {
    if(this.bitListNamesCache) return this.bitListNamesCache;
    this.bitListNamesCache = this.column(this.headers.name).getValues().flat();
    return this.bitListNamesCache;
  }

  get bitListNames() {
    return this.getBitListNames();
  }
  
  /***
   * Finds the row number of the bit name on the bit list sheet
   */
  findRowNumber(bitName) {
    return this.bitListNames.indexOf(bitName) + 1 + this.titleRow;
  }
  
  getBitContext(bitName) {
    if (!isBit(bitName)) return null;
    if(this.bitContexts && this.bitContexts[bitName]) return this.bitContexts[bitName];
    this.bitContexts = {};
    this.bitContexts[bitName] = new BitContext(bitName, this.spreadsheet);
    return this.bitContexts[bitName];
  }
  
	/**
	 * Checks whether or not this bit has been updated in the bitList sheet
	 *
	 * @returns true|false
	 */
	isUpdated(bitName) {
    var bitContextUpdated = this.getBitContext(bitName).updated;
    if(!(bitContextUpdated.getValue() instanceof Date)) 
      bitContextUpdated.setValue(new Date);
    var row = this.findRowNumber(bitName);
    var v = this.values;
    var e = this.values[row][this.headers.updated];
    debugger;
    return bitContextUpdated.getValue() == bitListSheetUpdatedDate;
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
