const nameColumnName = "Bit";
var bitListSheetName = ".Bit List";
MyUtilities.commonColumnNameSets.name.push(nameColumnName);

class BitList extends MyUtilities.TableContext {
  constructor(spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), sheet = bitListSheetName, titleRow = 1) {
    MyUtilities.assertSpreadsheet(spreadsheet);

    if(typeof sheet == "string")
      sheet = spreadsheet.getSheetByName(sheet);

    var range = sheet.getRange(1 , 1, sheet.getLastRow(), sheet.getLastColumn());

    super(range,titleRow);

    this.spreadsheet = spreadsheet;
    this.bitContexts = {};
	}

  update() {
    // For each sheet name check if it's on the list
    for(let i = 0; i <= this.bitSheetNames.length; i++) {
      let bitName = this.bitSheetNames[i];
      
      // If bit has been updated continue
      //if(this.isUpdated(bitName))
      this.isUpdated(bitName);
      return;
      
      //let bitRow = this.getBitRowDetails(bitName);

      //this.setRowValues(bitRow, rowNumber);
    }
  }

  getHeaders() {
    if (this.headerCache) return this.headerCache;

    var headerRow = this.row(this.titleRow);
    const numCells = this.range.getNumColumns();
    const headerValues = [];

    for (let c = 1; c < numCells; c++) {
      headerValues.push(headerRow.getCell(c, this.titleRow).getValue());
    }
    var t = this.sheet.getTables()[0];
    var y = t.getHeaderRow
    this.headerCache = {};

    for(let i = 0; i <= listTitles.length; i++)
      for(let columnNameSetName in commonColumnNameSets) {
        if(commonColumnNameSets[columnNameSetName].includes(listTitles[i]))
          this.headerCache[columnNameSetName] = i + 1;
        else
          this.headerCache[listTitles[i]] = i + 1;
      }
    var h = this.headers;
    debugger;
    return this.headerCache;
  }


  get headers() {
    return this.getHeaders();
  }

  /**
   * Returns all cells from a row
   */
  row(row) {
    if(typeof row == "string" && this.headerCache) row = this.column(this.headers.name).getValues().flat().indexOf(row);
    return this.range.offset(row, 1, 1, this.range.getNumColumns());
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
    var h = this.headers.name;
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
    if(this.bitContexts[bitName]) return this.bitContexts[bitName];

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
    var bitListSheetUpdatedDate = this.range.getCell(this.findRowNumber(bitName), this.headers.updated).getValue();
    return bitContextUpdated = bitListSheetUpdatedDate;
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
