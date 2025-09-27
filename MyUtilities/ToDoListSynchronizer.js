var ToDoListSynchronizer = class ToDoListSynchronizer {
  constructor(toDoList1,toDoList2) {
    assertToDoList(toDoList1);
    assertToDoList(toDoList2);

    if(!toDoList.updatedColumnNumber)
        toDoList.insertColumn("Updated");

    
  }
	sync() {
    for (var i = toDoList.titleRowNumber + 1; i <= toDoList.lastRow; i++)
				this.syncWithToDoListRow(toDoList, i);
	}

	syncWithToDoListRow(importToDoList, importListRowNumber) {
    importToDoList = assertToDoList(importToDoList);

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

    
    listToUpdate.importRow(updateListRowNumber,fetchList,fetchListRowNumber);
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

  importRow(thisRowNumber,fetchList,fetchListRowNumber) {
    // Create and fill row
    var row = [];
    var headerMapCount = Object.keys(this.headerMap).length;

    for(var i = 1; i <= headerMapCount; i++) {
      var updateTitle = getHeaderKeyByValue(this.headerMap,i);

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

  /**
   * Determines whether or not this row has already been synced
   */
  rowSynced(syncToDoList, syncListRowNumber) {
    syncToDoList = assertToDoList(syncToDoList);
    
    // Ensure the synced sheet has filled in its updated date
    if(syncUpdatedDate == "" || syncUpdatedDate == null) {
      syncToDoList.setValue(syncToDoList.headers.updated, syncListRowNumber, new Date());
      syncUpdatedDate = syncToDoList.getValue(syncToDoList.headers.updated, syncListRowNumber);
    }
    
    // Check if the updated date is the same
    var thisRowNumber = this.getThisRowNumberToUpdate(syncToDoList, syncListRowNumber);
    var thisUpdatedDate = this.updatedValues[thisRowNumber];
    var syncUpdatedDate = syncToDoList.getValue(syncToDoList.headers.updated, syncListRowNumber);

    return thisUpdatedDate != null && thisUpdatedDate.getTime() == syncUpdatedDate.getTime();
  }
}
