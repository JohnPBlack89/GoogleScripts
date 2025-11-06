const nameColumnName = "Bit";
var bitListSheetName = ".Bit List";
var columnNameSets = MyUtilities.commonColumnNameSets;
columnNameSets.name.push(nameColumnName);
columnNameSets["steps"] = ["Current Step"];


const totaledColumns = ["Topics","Links w/","Techniques Used","Project","Performances"];

const bestColumns = {
  "Earliest Step":"Current Step",
  "Highest Quality":"Quality"
  };

const worstColumns = {
  "Latest Step":"Current Step",
  "Lowest Quality":"Quality"
  };

class BitList extends MyUtilities.TableContext{
  constructor(titleRow = 1, spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), sheet = bitListSheetName) {
    console.log("Creating Bit List");
    MyUtilities.assertSpreadsheet(spreadsheet);

    if(typeof sheet == "string")
      sheet = spreadsheet.getSheetByName(sheet);

    assertSheet(sheet);

    var range = sheet.getDataRange();
    super(range, titleRow);
    this.bitListNames;
    this.spreadsheet = spreadsheet;
    this.bitContexts = {};
    this.sheet = sheet;
	}

  update() {
    // For each sheet name check if it's on the list
    for(let i = 0; i <= this.bitSheetNames.length; i++) {
      let bitName = this.bitSheetNames[i];
      
      // If bit has been updated continue
      if(this.bitUpdated(bitName))
        continue;

      this.setRowValues(bitName);
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
    this.sortBitListNames();
    return this.bitListNamesCache;
  }

  sortBitListNames() {
    this.bitListNamesCache = this.bitListNamesCache.sort((a, b) => {
      if (a === "" && b !== "") {
        return 1;
      }
      if (a !== "" && b === "") {
        return -1;
      }
      return a.localeCompare(b);
    });
  }

  get bitListNames() {
    return this.getBitListNames();
  }
  
  /***
   * Finds the row number of the bit name on the bit list sheet
   */
  getBitNumber(bitName) {
    var index = this.bitListNames.indexOf(bitName);

    if(index != -1) 
      return index;

    this.bitListNames.push(bitName);
    this.sortBitListNames();
    return this.bitListNames.indexOf(bitName);
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
	bitUpdated(bitName) {
    var bitContextUpdateDate = this.getBitContext(bitName).updatedOn;
    var rowNumber = this.getBitNumber(bitName);
    var columnNumber = this.headers["Last Updated"];
    var bitListSheetUpdatedDate = this.spreadsheet.getSheetByName(bitListSheetName).getRange(rowNumber,columnNumber).getValue();
    return bitContextUpdateDate == bitListSheetUpdatedDate;
	}

  setRowValues(bitName) {
    var bitContext = this.getBitContext(bitName);
    var bitNumber = this.getBitNumber(bitName);

    throw new Error("Need better row number formula in MyUtilities");
    // Need better row number formula in my utilities
    var rowNumber = this.rowNumber()
    var sheetRows = this.sheet.getLastRow();
    var to = this.row(bitName);
    var thisRow = this.row(bitNumber);

    thisRow.offset(0,this.headers["name"],1,1).setValue(bitContext.name);

    for(var header in this.headers) {
      // Totaled Columns
      if(totaledColumns.includes(header))
        thisRow.offset(0,this.headers[header],1,1).setValue(bitContext.getTotaledColumn(header));

      // Best Columns
      if(Object.keys(bestColumns).includes(header))
        thisRow.offset(0,this.headers[header],1,1).setValue(bitContext.getMostCellInColumn(bestColumns[header],"Best"));

      // Worst Columns
      if(Object.keys(worstColumns).includes(header))
        thisRow.offset(0,this.headers[header],1,1).setValue(bitContext.getMostCellInColumn(worstColumns[header],"Worst"));
    }
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
