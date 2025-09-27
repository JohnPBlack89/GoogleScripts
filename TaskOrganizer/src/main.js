var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var factory = new MyUtilities.ToDoListFactory();
// var longTerm = factory.createFromSheet("Long-Term", projectSpreadsheet, 1);
var toDoBoard = factory.createFromSheet("Tasks", projectSpreadsheet, 2);

function onEdit(e) {
  toDoBoard.organize();
  return;
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
  // importLongTerm();
	toDoBoard.organize();
}

function importLongTerm() {
  for(var projectNumber in longTerm.projectRichTextValues) {
    var link = longTerm.projectRichTextValues[projectNumber][0].getLinkUrl();
    if(link == null)
      continue;
    
    // Check if "Active" column is checked - if not, don't import
    if(!longTerm.activeValues[projectNumber][0])
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

function test() {
	toDoBoard.organize();
}