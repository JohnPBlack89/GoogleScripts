var TableContext = class TableContext {
  constructor(range, titleRow = 1) {
    this.range = range;
    this.titleRow = titleRow;
    this.headers;
    this.bitListNames;
	}

  getHeaders() {
    if (this.headerCache) return this.headerCache;

    const headerValues = this.range.offset(this.titleRow - 1,0,1, this.range.getNumColumns()).getValues()[0];

    this.headerCache = {};

    for(let i = 0; i <= headerValues.length; i++)
      for(let columnNameSetName in commonColumnNameSets) {
        if(commonColumnNameSets[columnNameSetName].includes(headerValues[i]))
          this.headerCache[columnNameSetName] = i + 1;
        else
          this.headerCache[headerValues[i]] = i + 1;
      }

    return this.headerCache;
  }

  get headers() {
    return this.getHeaders();
  }

  
  getHeaderLength() {
    return Object.entries(this.headers).filter(([key, value]) => value !== "" && value !== undefined).length;
  }
  
  get headerLength() {
    return this.getHeaderLength();
  }
  
  /**
   * Returns all cells from a column
   */
  column(column) {
    if(typeof column == "string") column = this.headers[column];
    return this.range.offset(1, column -1, this.range.getNumRows() - 1, 1);
  }

  /**
   * Returns all cells from a row
   */
  row(row) {
    if(typeof row == "string" && this.headerCache) row = this.column(this.headers.name).getValues().flat().indexOf(row);
    return this.range.offset(row, 0, 1, this.range.getNumColumns());
  }


  /**
   * Sort by column
   */
  sortBy(column) {
    if(typeof column == "string") column = this.headers[column];
    const trimmedRange = this.range.offset(this.titleRow + 1, 1, this.range.getNumRows(), this.range.getNumColumns());
    trimmedRange.sort(column);
  }

  /**
   * Checks if a given URL is a reference to another sheet within the same document
   * An internal sheet reference typically contains the spreadsheet ID and a "#gid=" parameter.
   *
   * @param {string} url The URL to check.
   * @returns {boolean} True if the URL is an internal sheet reference, false otherwise.
  */
  isInternalSheetReference(url) {
    if (!url || typeof url !== "string") return false;

    var referenceId = extractSpreadsheetId(url);
    var thisId = this.spreadsheet.getId();
    return referenceId == thisId;
  }
}
