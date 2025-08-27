var taskSheetNames = ["Tasks", "To-Do"];
var nameColumnNames = ["Name"];
var colors = {
  pastDateBackgroundColor1 : "#990000",
  pastDateBackgroundColor2 : "#660000",
  todayBackgroundColor1 : "#bf9000",
  todayBackgroundColor2 : "#7f6000",
  nearDateBackgroundColor1 : "#38761d",
  nearDateBackgroundColor2 : "#274e13",
  finishedBackgroundColor : "#434343",
  ndwBackgroundColor1 : "#990000",
  ndwBackgroundColor2 : "#660000",
}

var ToDoList = class ToDoList extends TableContext {
	constructor(sheetName,  spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(sheetName, spreadsheet, titleRowNumber);

    for(var color in colors)
      this[color] = colors[color];
	}


  /** Organizes this list by its Due column
   */
  organize() {
    if(this.headerMap["Due"] == undefined) return;

    this.dueSort();
    this.highlightNDW();
	  this.highlightDates();
    Logger.log(`Finished ${this.sheet.getName}.organize`);
  }

	/** Highlights the due date column cells
	 * Based on TODAY'S DATE AND this.nearDateDaysAhead
	 */
	highlightDates() {
		var totalRows = this.lastRow - this.titleRowNumber;
		var today = new Date();
		var todayDate = getDateAsNumber(today);

		for (var i = 0; i < totalRows; i++) {
			var cellDate = getDateAsNumber(this.dueValues[i][0]);
			if (cellDate == null || cellDate == 0) {
				this.sheet
					.getRange(i + 1 + this.titleRowNumber, 1, 1, this.lastColumn)
					.setBackground("#434343");
        /************* This is where to put the move row function to move finished tasks to the finished Tasks sheet */
				continue;
			}

			var daysAhead = cellDate - todayDate;
			var cell = this.sheetRange.getCell(i + 1, this.dueColumnNumber);

			var addition = (i % 2) + 1;

			if (daysAhead < 0) {
				cell.setBackground(
					this["pastDateBackgroundColor" + addition.toString()]);
			} else if (daysAhead === 0) {
				cell.setBackground(this["todayBackgroundColor" + addition.toString()]);
			} else if (daysAhead <= warningDateDaysAhead) {
				cell.setBackground(
					this["nearDateBackgroundColor" + addition.toString()]);
			}
		}
	}

  highlightNDW() {
		for (var i = 0; i < this.lastRow - this.titleRowNumber; i++) {
      var row = this.sheet.getRange(i + this.titleRowNumber + 1,1,1, this.lastColumn);
			if (!this.nDWValues[i][0]) {
        row.setBackground(null);
        continue;
      }

			var addition = (i % 2) + 1;
      row.setBackground(this["ndwBackgroundColor" + addition.toString()]);
		}
  }

  getProjectName() {
    return this.spreadsheet.getName();
  }

  get projectName() {
    return this.getProjectName();
  }

  /**  Update last edited time
   */
  updateRowDate(e) {
    if(this.firstColumn <= e.range.getColumn() <= this.lastColumn)
      this.sheet.getRange(e.range.getRow(),this.updatedColumnNumber).setValue(new Date());
  }

  /**
   * Checks if a given URL is a reference to another sheet within the same document
   * An internal sheet reference typically contains the spreadsheet ID and a "#gid=" parameter.
   *
   * @param {string} url The URL to check.
   * @returns {boolean} True if the URL is an internal sheet reference, false otherwise.
  */
  isInternalSheetReference(url) {
    if (!url || typeof url !== "string") {
      return false;
    }

    var referenceId = extractSpreadsheetId(url);
    var thisId = this.spreadsheet.getId();
    return referenceId == thisId;
  }

  syncWithUrl(url, columnMap = {}) {
    if(url == null)
          return;

    if(this.isInternalSheetReference(url)) {
      var gid = extractSpreadsheetId(url);
      var name = getSheetNameByGid(this.Spreadsheet,gid);
      this.syncWithToDoList(new ToDoList(name, this.Spreadsheet), columnMap)
    }

    if(isGoogleSheetReference(url))
      this.syncWithSpreadsheet(getSpreadsheetFromUrl(url), columnMap)

    if(isGoogleDocReference(url))
      this.importGoogleDoc(url, columnMap);
  }

	syncWithSpreadsheet(spreadsheet, columnMap = {}) {
		assertSpreadsheet(spreadsheet);

    const spreadsheetSheetNames = this
      .spreadsheet
			.getSheets()
			.map((sheet) => sheet.getName());

		var taskSheetName = taskSheetNames.filter((name) =>
			spreadsheetSheetNames.includes(name)
		);

		if (taskSheetName == null) return;
		
    this.syncWithToDoList(new ToDoList(taskSheetName[0], spreadsheet), columnMap);
	}

	syncWithToDoList(toDoList, columnMap = {}) {
    toDoList = assertToDoList(toDoList);

		if(!toDoList.updatedColumnNumber)
        toDoList.insertColumn("Updated");

    for (var i = toDoList.titleRowNumber + 1; i <= toDoList.lastRow; i++)
				this.syncWithToDoListRow(toDoList, i, columnMap);
	}

	syncWithToDoListRow(importToDoList, importListRowNumber, columnMap = {}) {
    importToDoList = assertToDoList(importToDoList);

    importToDoList.applyColumnMap(columnMap);

    if(this.rowUpdated(importToDoList, importListRowNumber)) {
      Logger.log(`Task ${importToDoList.nameValues[importListRowNumber - importToDoList.titleRowNumber - 1][0]} already imported`);
      return;
    }

    var thisRowNumber = this.getThisRowNumberToUpdate(importToDoList, importListRowNumber);
    
    // Check which list should be updated, based on last updated date
    var thisUpdatedDate = this.updatedValues[thisRowNumber];
    var importUpdatedDate = importToDoList.getValue(importToDoList.updatedColumnNumber,importListRowNumber);
    
    var updateThisList = thisUpdatedDate == null ||  thisUpdatedDate > importUpdatedDate;
    var listToUpdate = updateThisList ? this : importToDoList;
    var fetchList = updateThisList ? importToDoList : this;
    var updateListRowNumber = updateThisList ? thisRowNumber : importListRowNumber;
    var fetchListRowNumber = updateThisList ? importListRowNumber : thisRowNumber;

    var daysUntilDueDate = this.daysUntilDueDate(fetchList, fetchListRowNumber);
    if (daysUntilDueDate > daysToImportTask) return;

    
    listToUpdate.importRow(updateListRowNumber,fetchList,fetchListRowNumber,columnMap);
	}

  // Check if sheet has already imported a task with the same guid
  // Find if current to do list has a matching task, otherwise, add a new row
  getThisRowNumberToUpdate(syncWithToDoList, importListRowNumber) {
    syncWithToDoList = assertToDoList(syncWithToDoList);

    var thisRowNumber = this.lastRow + 1;

      // If the import list doesn't have an id, import it to the last row on this sheet
    if (!syncWithToDoList.idValues) {
      syncWithToDoList.insertColumn("Id")
      return thisRowNumber;
    }

    var importRowId = syncWithToDoList.idValues[importListRowNumber - syncWithToDoList.titleRowNumber - 1][0];

    if(importRowId == null || importRowId == "") 
        syncWithToDoList.setValue(syncWithToDoList.idColumnNumber,importListRowNumber,createGuid());
    else if(this.idValues.flat().includes(importRowId)) 
      thisRowNumber = this.idValues.flat().indexOf(importRowId) + syncWithToDoList.titleRowNumber * 2 + 1;

    return thisRowNumber;
  }

  /**
   * Determines whether or not this row has already been updated
   */
  rowUpdated(importToDoList, importListRowNumber) {
    // Ensure the imported sheet has filled in its updated date
    if(importUpdatedDate == "" || importUpdatedDate == null) {
      importToDoList.setValue(importToDoList.updatedColumnNumber,importListRowNumber, new Date());
      importUpdatedDate = importToDoList.getValue(importToDoList.updatedColumnNumber,importListRowNumber);
    }
    
    // Check if the updated date is the same
    var thisRowNumber = this.getThisRowNumberToUpdate(importToDoList, importListRowNumber);
    var thisUpdatedDate = this.updatedValues[thisRowNumber];
    var importUpdatedDate = importToDoList.getValue(importToDoList.updatedColumnNumber,importListRowNumber);

    return thisUpdatedDate != null && thisUpdatedDate.getTime() == importUpdatedDate.getTime();
  }

  
	/***
	 * Hides or Unhides all rows in a table
	 *
	 * if the checkbox is CHECKED the row is SHOWN
	 * if UNCHECK the row is HIDDEN
	 */
	showHideRows(checkboxColumn) {
		if (typeof checkboxColumn == "number") checkboxColumn = this.headers[checkboxColumn];

		for (var i = this.titleRow + 1; i <= this.lastRow; i++) {
			var checkboxCell = this.headers[checkboxColumn]

			// Check if the checkbox is checked
			if (checkboxCell.isChecked()) this.range.showRows(i);
			else this.range.hideRows(i);
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
			var checkboxCell = this.range.getRange(checkboxRow, i);

			if (checkboxCell.isChecked()) this.range.hideColumns(i);
			else this.range.showColumns(i);
		}
	}


  applyColumnMap(columnMap) {
    this.importColumnHeaders = {};

    headers.forEach((header, index) => {
      this.importColumnHeaders[header] = index + 1; // Column numbers start at 1
    });
  }

  importRow(thisRowNumber,fetchList,fetchListRowNumber,columnMap) {
    // Create and fill row
    var row = [];
    var headerMapCount = Object.keys(this.headerMap).length;

    for(var i = 1; i <= headerMapCount; i++) {
      var updateTitle = getHeaderKeyByValue(this.headerMap,i);

      if(columnMap.hasOwnProperty(updateTitle))
        updateTitle = columnMap[updateTitle];

      var importValue = fetchList.getValue(updateTitle,fetchListRowNumber);

      if(updateTitle == "Project")
        importValue = fetchList.project;

      if(nameColumnNames.includes(updateTitle)) {
        var url = fetchList.sheet.getRange(fetchListRowNumber,i).getRichTextValue().getLinkUrl();
        if(url) this.syncWithUrl(url);
      }

      row.push(importValue);
    }

    this.sheet.getRange(thisRowNumber,1,1,row.length).setValues([row]);
  }

  importGoogleDoc(url, columnMap = {}) {
		var table = getGoogleDocTable(url).asTable();
    var rows = table.getNumRows();
    var headerRow = table.getRow(0).getValues();
    debugger;
	}
}
