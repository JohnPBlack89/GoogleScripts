var taskSheetNames = ["Tasks", "To-Do"];
var nameColumnNames = ["Name"]

var ToDoList = class ToDoList extends TableContext {
	constructor(sheetName,  spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(sheetName, spreadsheet, titleRowNumber);

    this.pastDateBackgroundColor1 = "#990000";
    this.pastDateBackgroundColor2 = "#660000";
    this.todayBackgroundColor1 = "#bf9000";
    this.todayBackgroundColor2 = "#7f6000";
    this.nearDateBackgroundColor1 = "#38761d";
    this.nearDateBackgroundColor2 = "#274e13";
    this.finishedBackgroundColor = "#434343";
    this.ndwBackgroundColor1 = "#990000";
    this.ndwBackgroundColor2 = "#660000";
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
    if(this.Spreadsheet.getName())
      return this.sheet.getName();

    return this.Spreadsheet.getName();
  }

  get project() {
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
    var thisId = this.Spreadsheet.getId();
    return referenceId == thisId;
  }


  /*** Imports ***/
  syncWithUrl(url, columnMap = {}) {
    if(url == null)
          return;

    // Check if cell is a link to another sheet
    if(this.isInternalSheetReference(url)) {
      var gid = extractSpreadsheetId(url);
      var name = getSheetNameByGid(this.Spreadsheet,gid);
      this.syncWithToDoList(new ToDoList(name, this.Spreadsheet), columnMap)
    }

    if(isGoogleSheetReference(url)) {
      this.syncWithSpreadsheet(getSpreadsheetFromUrl(url), columnMap)
    }

    if(isGoogleDocReference(url))
      this.importGoogleDoc(url, columnMap);
  }

	syncWithSpreadsheet(spreadsheet, columnMap = {}) {
		assertSpreadsheet(spreadsheet);

		const spreadsheetSheetNames = spreadsheet
			.getSheets()
			.map((sheet) => sheet.getName());

		const taskSheetName = taskSheetNames.filter((name) =>
			spreadsheetSheetNames.includes(name)
		);

		if (taskSheetName == null) return;
		
    this.syncWithToDoList(new ToDoList(taskSheetName[0], spreadsheet), columnMap);
	}

	syncWithToDoList(toDoList, columnMap = {}) {
		if (typeof ToDoList == "string") toDoList = new ToDoList(toDoList, 1);

		if (!(toDoList instanceof ToDoList))
			throw new Error(
				"Must pass either a string or ToDoList object to function importSheet(toDoList)"
			);

		if(!toDoList.updatedColumnNumber) {
        toDoList.insertColumn("Updated");
    }

    var d = toDoList.titleRowNumber;
    var o = toDoList.lastRow;

    for (var i = toDoList.titleRowNumber + 1; i <= toDoList.lastRow; i++)
				this.syncWithToDoListRow(toDoList, i, columnMap);
	}

	syncWithToDoListRow(syncWithToDoList, importListRowNumber, columnMap = {}) {
    // Ensure a ToDoList was passed
		if (!(syncWithToDoList instanceof ToDoList))
			throw new Error(
				"Must pass a ToDoList object to function syncWithToDoListRow(syncWithToDoList, importListRowNumber, columnMap = {})" 
			);

    // Need to map dues, name values first!!!
    if(columnMap.hasOwnProperty("Due")) {
      syncWithToDoList.dueDateColumnName = columnMap["Due"];
      syncWithToDoList.dueDateColumnNumber = syncWithToDoList.headerMap[columnMap["Due"]];
    } else {
      syncWithToDoList.dueDateColumnName = syncWithToDoList.dueColumnName;
      syncWithToDoList.dueDateColumnNumber = syncWithToDoList.dueColumnNumber;
    }
    

    if(columnMap.hasOwnProperty("Updated")) {
      syncWithToDoList.updatedColumnName = columnMap["Updated"];
      syncWithToDoList.updatedColumnNumber = syncWithToDoList.headerMap[columnMap["Updated"]];
    }

    var thisRowNumber = this.getThisRowNumberToUpdate(syncWithToDoList, importListRowNumber);
    
    // Check if the imported date is the same
    var thisUpdatedDate = this.updatedValues[thisRowNumber];
    var importUpdatedDate = syncWithToDoList.getValue(syncWithToDoList.updatedColumnNumber,importListRowNumber);

    // Ensure the imported sheet has filled in its updated date
    if(importUpdatedDate == "" || importUpdatedDate == null) {
      syncWithToDoList.setValue(syncWithToDoList.updatedColumnNumber,importListRowNumber, new Date());
      importUpdatedDate = syncWithToDoList.getValue(syncWithToDoList.updatedColumnNumber,importListRowNumber);
    }

    if(thisUpdatedDate != null && thisUpdatedDate.getTime() == importUpdatedDate.getTime()) {
      Logger.log(`Task ${syncWithToDoList.nameValues[importListRowNumber - syncWithToDoList.titleRowNumber - 1][0]} already imported`)
      return;
    }
    
    // Check which list should be updated, based on last updated date
    var updateThisList = thisUpdatedDate == null ||  thisUpdatedDate > importUpdatedDate;
    var listToUpdate = updateThisList ? this : syncWithToDoList;
    var fetchList = updateThisList ? syncWithToDoList : this;
    var updateListRowNumber = updateThisList ? thisRowNumber : importListRowNumber;
    var fetchListRowNumber = updateThisList ? importListRowNumber : thisRowNumber;

    // Check if due date is within import date;
    var dueDate = fetchList.getValue(fetchList.dueDateColumnName, fetchListRowNumber);
    if(!dueDate) {
      Logger.log("Task has no due date");
      return;
    }

    var datesUntilDueDate = getDaysBetween(new Date(), dueDate);
    if (datesUntilDueDate > daysToImportTask) return;

    
    // Create and fill row
    var row = [];
    var headerMapCount = Object.keys(listToUpdate.headerMap).length;

    for(var i = 1; i <= headerMapCount; i++) {
      var updateTitle = getHeaderKeyByValue(listToUpdate.headerMap,i);

      if(columnMap.hasOwnProperty(updateTitle))
        updateTitle = columnMap[updateTitle];

      var importValue = fetchList.getValue(updateTitle,fetchListRowNumber);

      if(updateTitle == "Project")
        importValue = fetchList.project;

      if(nameColumnNames.includes(updateTitle)) {
        var i = fetchList.sheet.getRange(fetchListRowNumber,i).getRichTextValue();
        debugger;
      }

      row.push(importValue);
    }

    listToUpdate.sheet.getRange(updateListRowNumber,1,1,row.length).setValues([row]);
	}

  // Check if sheet has already imported a task with the same guid
  // Find if current to do list has a matching task, otherwise, add a new row
  getThisRowNumberToUpdate(syncWithToDoList, importListRowNumber) {
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

  importGoogleDoc(url, columnMap = {}) {
    console.log("import Google Doc not implemented yet");
		// var table = getGoogleDocTable(url, tableNumberInTab, tableTabName);
	}
}
