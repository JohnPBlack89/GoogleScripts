var GoogleSheetToDoList = class GoogleSheetToDoList extends ToDoList{
  constructor(table) {
    super(table);
  }

   /** 
   * Returns a map of the headers for this table
   * {header, index}
   */
  getHeaderCache() {
    if (this.headerCache) return this.headerCache;

    const row = this.range.getRow(0);
    const numCells = row.getNumCells();
    this.headerCache = {};

    for(let i = 0; i < numCells; i++)
      for(let columnNameSetName in commonColumnNameSets)
        if(commonColumnNameSets[columnNameSetName].includes(row.getCell(i).getText()))
          this.headerCache[columnNameSetName] = i + 1;

    return this.headerCache;
  }

  get headers() {
    return this.getHeaderCache();
  }

  /** 
   * Organizes this list by its Due column
   */
  organize() {
    this.sortBy(this.headers.due);
  }

  /**
   * Sort by column
   */
  sortBy(column) {
    if(typeof column == "string") column = this.headers[column.toLowerCase()];
    const row = this.range.getRow(0);
    const numColumns = row.getNumCells();

    const dataRows = [];
    for (let r = 1; r < this.range.getNumRows(); r++) {
      const row = this.range.getRow(r);
      const rowData = [];
      for (let c = 0; c < row.getNumCells(); c++) {
        rowData.push(row.getCell(c).getText());
      }
      dataRows.push(rowData);
    }

    // Step 3: Sort data rows by target column
    dataRows.sort((a, b) => a[column].localeCompare(b[column]));

    // Step 4: Replace table rows with sorted data
    for (let r = 1; r < this.range.getNumRows(); r++) {
      const row = this.range.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        row.getCell(c).setText(dataRows[r - 1][c]);
      }
    }
  }

  /**
   * Sets the colors for a row for a passed range
   *
  getRowColors(range) {
    assertSingleRow(range);

    if(this.isCompletedRow(range)) {
      range.setBackground(this.finishedBackgroundColor);
      return;
    }

    // Set overall range color depending on if the row is even and ndw
    let rowColor = (range.getRow() - this.titleRow) % 2 != 1 ? this.evenRowColor : this.oddRowColor;

    if(this.isNDWRow(range))
        rowColor = blendHexColors(rowColor, this.ndwBackgroundColor);
      
    range.setBackground(rowColor);
    
    this.setDueDateColors(range);
  }

  /**
   * Returns whether or not the row is NDW
   *
  isNDWRow(range) {
    assertSingleRow(range);
    return range.getValues()[0][this.headers.ndw - 1]; //Need -1 as columns are 1-indexed and array is 0-indexed
  }

  /**
   * Returns whether or not the row has a value in the done column
   *
  isCompletedRow(range) {
    assertSingleRow(range);
    return !!range.getValues()[0][this.headers.done - 1]; //Need -1 as columns are 1-indexed and array is 0-indexed
  }

  /**
   * Sets the colors for the due date cell 
   *
  setDueDateColors(range) {
    assertSingleRow(range);

    var cell = range.getCell(1, this.headers.due);
    assertSingleCell(cell);

    var dueDate = cell.getValue();
    var daysUntilDueDate = getDaysBetween(new Date(), dueDate);
    
    var currentBG = cell.getBackground();

    if(daysUntilDueDate < 0) cell.setBackground(blendHexColors(currentBG, this.pastDateColor)); 
    else if(daysUntilDueDate < this.warningDateDaysAhead) cell.setBackground(blendHexColors(currentBG, this.warningDateColor)); 
  }

  /**
   * Checks if a given URL is a reference to another sheet within the same document
   * An internal sheet reference typically contains the spreadsheet ID and a "#gid=" parameter.
   *
   * @param {string} url The URL to check.
   * @returns {boolean} True if the URL is an internal sheet reference, false otherwise.
  *
  isInternalSheetReference(url) {
    if (!url || typeof url !== "string") return false;

    var referenceId = extractSpreadsheetId(url);
    var thisId = this.spreadsheet.getId();
    return referenceId == thisId;
  }*/
}
