var commonColumnNameSets = {
  id : ["Id"],
  updated : ["Updated", "Last Updated"],
  name : ["Name", "Task"],
  due : ["Due", "Due Dates", "Due Date"],
  done : ["Done"],
  ndw : ["NDW"],
  notes : ["Notes"]
}

var ToDoList = class ToDoList extends TableContext{
  constructor(range) {
    super(range);
    this.warningDateDaysAhead = 7;
    this.daysToImportTask = 45;

    this.warningDateColor = "#b59e00";
    this.pastDateColor = "#980000";

    this.finishedBackgroundColor = "#434343";
    this.ndwBackgroundColor = "#990000";
    this.evenRowColor = "#666666";
    this.oddRowColor= "#999999";
  }

  /** 
   * Organizes this list by its Due column
   */
  organize() {
    this.sortBy(this.headers.due);

    for(var row = this.titleRow + 1; row <= this.range.getNumRows() - this.titleRow; row++)
      this.getRowColors(this.range.offset(row,0,1,this.range.getNumColumns()));
  }

  /**
   * Sets the colors for a row for a passed range
   */
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
   */
  isNDWRow(range) {
    assertSingleRow(range);
    return range.getValues()[0][this.headers.ndw - 1]; //Need -1 as columns are 1-indexed and array is 0-indexed
  }

  /**
   * Returns whether or not the row has a value in the done column
   */
  isCompletedRow(range) {
    assertSingleRow(range);
    return !!range.getValues()[0][this.headers.done - 1]; //Need -1 as columns are 1-indexed and array is 0-indexed
  }

  /**
   * Sets the colors for the due date cell 
   */
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
}
