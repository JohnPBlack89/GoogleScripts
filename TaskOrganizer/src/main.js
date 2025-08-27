var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var longTerm = new MyUtilities.ToDoList("Long-Term", projectSpreadsheet, 1);
var toDoBoard = new MyUtilities.ToDoList("Tasks", projectSpreadsheet, 2);

function onEdit(e) {
  // Check if "Allow Updates" button is checked
  var allowToDoUpdates = toDoBoard.sheet.getRange("E1").getValues()[0][0];
  if(!allowToDoUpdates) return;

  // Holiday Prep edits
  if (projectSpreadsheet.getActiveSheet().getName() == holidayPrep.sheet.getName())
		migrateHolidayPrepToTasks();

  // To-Do Board edits
	if (projectSpreadsheet.getActiveSheet().getName() == toDoBoard.sheet.getName()) {
    // toDoBoard.updateRowDate(e)
		toDoBoard.organize();
    toDoBoard.genreSetHyperlinks();
    toDoBoard.projectSetHyperlinks();
  }
  // Long term edits
  if (projectSpreadsheet.getActiveSheet().getName() == longTerm.sheet.getName() ) {
		longTerm.genreSetHyperlinks();
  }
}

function midnightRun() {
  importLongTerm();
  migrateHolidayPrepToTasks();
	toDoBoard.organize();
}

function importLongTerm() {
  for(var projectNumber in longTerm.projectRichTextValues) {
    var link = longTerm.projectRichTextValues[projectNumber][0].getLinkUrl();
    if(link == null)
      continue;
    
    // Check if "Active" column is check- if not, don't import
    var projectActive = longTerm.activeValues[projectNumber][0];
    if(!projectActive)
      continue;
    
    toDoBoard.syncWithUrl(link);
  }
  
  // Import Genres
  for(var genreNumber in projectSpreadsheet.getRangeByName("GenreNamedRange").getRichTextValues()) {
    var link = projectSpreadsheet.getRangeByName("GenreNamedRange").getRichTextValues()[genreNumber][0].getLinkUrl();
    if(link == null)
      continue;

    toDoBoard.syncWithUrl(link);
  }
}