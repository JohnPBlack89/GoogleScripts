var LazyTable = class LazyTable {
	constructor(range) {
		this.range = range;
		this.titleRow = 1;
    this.firstColumn = 1;
    
		for(var header in this.headers)
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
    const columnRangeCache = `${baseName}Cache`;

    /**
     * [basename]
     * Creates a getter that returns all of the cells in a column
     */
    Object.defineProperty(this, `${baseName}`, {
      get: function () {
        if (this[columnRangeCache] != null) return this[columnRangeCache];

        this[columnRangeCache] = this.range
			    .getRange(this.titleRow + 1, this.headers[columnName], this.lastRow - this.titleRow, 1);

        return this[columnRangeCache];
      },
      configurable: true,
      enumerable: true,
    });

    /**
     * [baseName]Sort
     * Creates a sort function for the passed column
     */
    Object.defineProperty(this, sortFunctionName , { value: function() {
		    this.range.sort(this.headers[columnNumber]);
	    }, configurable: true, enumerable: true,
    })

    Object.defineProperty(this, hyperlinkFunctionName , { value: function() {
      var cell;
      for(let i = this.titleRow + 1; i <= this.lastRow; i++) {
        cell = this.range.getRange(i, this[columnNumber]);
        setCellHyperlinksFromNamedRange(cell, namedRangeName, this.spreadsheetCache);
      }
      }, configurable: true, enumerable: true,
    })
  }

  getHeaderMap() {
    if (this.headerCache != null) return this.headerCache;

    if (
      this.range == null ||
      this.range.getLastColumn() == 0 ||
      this.range.getRange(this.titleRow, 1, 1, this.lastColumn) == undefined
    )
      return {};

    var headers = this.range.getRange(this.titleRow, 1, 1, this.lastColumn).getValues()[0];
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
    if (this.rangeRangeCache != null) return this.rangeRangeCache;

    this.rangeRangeCache = this.range.getRange(
        this.titleRow + 1,
        this.firstColumn,
        this.lastRow - this.titleRow + 1,
        this.lastColumn
    );

    return this.rangeRangeCache;
  }

  get sheetRange() {
    return this.getSheetRange();
  }

  /** */
  get spreadsheet() {
    return this.spreadsheetCache;
  }

	/**
	 * Returns the GoogleAppsScript.Spreadsheet.Sheet object that this LazyTable represents
	 * if none is present, it will retrieve, set, and return the property
	 *
	 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} The Sheet object if found, otherwise null
	 */
	getSheet() {
		if (this.rangeCache != null) return this.rangeCache;

    if(this.spreadsheetCache == null)
      throw new Error("No Spreadsheet found");

		this.rangeCache = this.spreadsheetCache.getSheetByName(this.name);
		return this.rangeCache;
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

		this.lastRowCache = this.range.getLastRow();
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

		this.lastColumnCache = this.range.getLastColumn();
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

		var rowValues = this.range.getRange(1, column, this.lastRow, 1).getValues();

		for (let i = this.titleRow; i < rowValues.length; i++) {
			if (rowValues[i][0] == cellValue) {
				return i + 1;
			}
		}

		return null;
	}
  
  insertColumn(columnName, columnNumber = this.firstColumn) {
    this.range.insertColumnBefore(columnNumber);
    this.setValue(columnNumber, this.titleRow,columnName);
    this.headerCache == null;
  }

	getValue(column, rowNumber) {
		if (typeof column == "string") column = this.headers[column];

		if (column == null || rowNumber == null) return null;

		var range = this.range.getRange(rowNumber, column).getValue();
		return range;
	}

	setValue(column, rowNumber, value) {
		if (typeof column == "string") column = this.headers[column];
		if (this.range == null) this.getSheet();

		this.range.getRange(rowNumber, column).setValue(value);
	}
}
