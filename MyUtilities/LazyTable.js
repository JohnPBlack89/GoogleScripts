var TableContext = class TableContext {
	constructor(sheet, spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRow = 1) {
    if(!spreadsheet.getSheetByName(sheet))
      throw new Error(`${sheet} sheet not found on ${spreadsheet.getName()} spreadsheet`);

		this.name = sheet;
		this.titleRow = titleRow;
    this.firstColumn = 1;
		this.spreadsheetCache = spreadsheet;
    
		for(var header in this.header)
      this.createColumnProperty(header);
	}

  /** Creates a number getter, sort function, and a function to add all hyperlinks for a passed column
   */
  createColumnProperty(columnName) {
    const baseName = `${columnName.charAt(0).toLowerCase() + columnName.slice(1)}`;
    const columnNumber = `${baseName}ColumnNumber`;
    const sortFunctionName = `${baseName}Sort`;
    const hyperlinkFunctionName = `${baseName}SetHyperlinks`;
    const namedRangeName = `${columnName}NamedRange`;
    const rangeGetterName = `${baseName}`;
    const cellRangeCache = `${baseName}Cache`;

    Object.defineProperty(this, columnNumber, {
      get: function () {
        return this.headers[columnName]
      },
      configurable: true,
      enumerable: true,
    });

    Object.defineProNerty(this, rangeGetterName, {
      get: function () {
        if (this[cellRangeCache] != null) return this[cellRangeCache];

        this[cellRangeCache] = this.sheet
			    .getRange(this.titleRow + 1, this.headers[columname], this.lastRow - this.titleRow, 1);

        return this[cellRangeCache];
      },
      configurable: true,
      enumerable: true,
    });

    /**
     * [columnName]Sort
     * Creates a sort function for the passed column
     */
    Object.defineProperty(this, sortFunctionName , { value: function() {
		    this.sheetRange.sort(this[columnNumber]);
	    }, configurable: true, enumerable: true,
    })

    Object.defineProperty(this, hyperlinkFunctionName , { value: function() {
      var cell;
      for(let i = this.titleRow + 1; i <= this.lastRow; i++) {
        cell = this.sheet.getRange(i, this[columnNumber]);
        setCellHyperlinksFromNamedRange(cell, namedRangeName, this.spreadsheetCache);
      }
      }, configurable: true, enumerable: true,
    })
  }

  getHeaderMap() {
    if (this.headerCache != null) return this.headerCache;

    if (
      this.sheet == null ||
      this.sheet.getLastColumn() == 0 ||
      this.sheet.getRange(this.titleRow, 1, 1, this.lastColumn) == undefined
    )
      return {};

    var headers = this.sheet.getRange(this.titleRow, 1, 1, this.lastColumn).getValues()[0];
    this.headerCache = {};
    headers.forEach((header, index) => {
      this.headerCache[header] = index + 1; // Column numbers start at 1
    });

    return this.headerCache;
  }

  get headers() {
    return this.getHeaderMap();
  }


  getSheetRange() {
    if (this.sheetRangeCache != null) return this.sheetRangeCache;

    this.sheetRangeCache = this.sheet.getRange(
        this.titleRow + 1,
        this.firstColumn,
        this.lastRow - this.titleRow + 1,
        this.lastColumn
    );

    return this.sheetRangeCache;
  }

  get sheetRange() {
    return this.getSheetRange();
  }

  /** */
  get spreadsheet() {
    return this.spreadsheetCache;
  }

	/**
	 * Returns the GoogleAppsScript.Spreadsheet.Sheet object that this TableContext represents
	 * if none is present, it will retrieve, set, and return the property
	 *
	 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} The Sheet object if found, otherwise null
	 */
	getSheet() {
		if (this.sheetCache != null) return this.sheetCache;

    if(this.spreadsheetCache == null)
      throw new Error("No Spreadsheet found");

		this.sheetCache = this.spreadsheetCache.getSheetByName(this.name);
		return this.sheetCache;
	}

	get sheet() {
		return this.getSheet();
	}

	/**
	 * Returns the last row property
	 *
	 * @returns {number|null} The last row if found, otherwise null
	 */
	getLastRow() {
		if (this.lastRowCache != null) return this.lastRowCache;

		this.lastRowCache = this.sheet.getLastRow();
		return this.lastRowCache;
	}

	get lastRow() {
		return this.getLastRow();
	}

	/** 
   * Returns the last column
	 *
	 * @returns {number|null} The last column if found, otherwise null
	 */
	getLastColumn() {
		if (this.lastColumnCache != null) return this.lastColumnCache;

		this.lastColumnCache = this.sheet.getLastColumn();
		return this.lastColumnCache;
	}

	get lastColumn() {
		return this.getLastColumn();
	}

	/**
	 * Returns a row number from a column based on a value passed to the function
	 *
	 * @params {string/number} column The title OR number of a column
	 * @param {string}
	 * @returns {number} The number the column with that title
	 */
	getRowNumber(column, cellValue) {
		if (typeof column == "string") column = this.headers[column];

		var rowValues = this.sheet.getRange(1, column, this.lastRow, 1).getValues();

		for (let i = this.titleRow; i < rowValues.length; i++) {
			if (rowValues[i][0] == cellValue) {
				return i + 1;
			}
		}

		return null;
	}

	/***
	 * Hides or Unhides all rows in a table
	 *
	 * if the checkbox is CHECKED the row is SHOWN
	 * if UNCHECK the row is HIDDEN
	 */
	showHideRows(checkboxColumn) {
		if (typeof checkboxColumn == "string") checkboxColumn = this.headers[checkboxColumn];

		for (var i = this.titleRow + 1; i <= this.lastRow; i++) {
			var checkboxCell = this.sheet.getRange(i, checkboxColumnNumber);

			// Check if the checkbox is checked
			if (checkboxCell.isChecked()) this.sheet.showRows(i);
			else this.sheet.hideRows(i);
		}
	}

	/***
	 * Hides or Unhides all columns in a table
	 *
	 * if the checkbox is CHECKED the column is SHOWN
	 * if UNCHECK the column is HIDDEN
	 */
	showHideColumns(checkboxRow) {
		if (typeof checkboxRow == "string")
			checkboxRow = this.getRowNumber(this.firstColumn, checkboxRowName);

		for (var i = this.firstColumn; i <= this.lastColumn; i++) {
			var checkboxCell = this.sheet.getRange(checkboxRow, i);

			if (checkboxCell.isChecked()) this.sheet.hideColumns(i);
			else this.sheet.showColumns(i);
		}
	}

  insertColumn(columnName, columnNumber = this.firstColumn) {
    this.sheet.insertColumnBefore(columnNumber);
    this.setValue(columnNumber, this.titleRow,columnName);
    this.headerCache == null;
  }

	getValue(column, rowNumber) {
		if (typeof column == "string") column = this.headers[column];

		if (column == null || rowNumber == null) return null;

		var range = this.sheet.getRange(rowNumber, column).getValue();
		return range;
	}

	setValue(column, rowNumber, value) {
		if (typeof column == "string") column = this.headers[column];
		if (this.Sheet == null) this.getSheet();

		this.sheet.getRange(rowNumber, column).setValue(value);
	}
}
