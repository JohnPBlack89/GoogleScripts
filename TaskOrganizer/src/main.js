var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var longTerm = new MyUtilities.ToDoList("Long-Term", projectSpreadsheet, 1);
var toDoBoard = new MyUtilities.ToDoList("Tasks", projectSpreadsheet, 2);

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function onEdit(e) {
  // To-Do Board edits
	if (projectSpreadsheet.getActiveSheet().getName() == toDoBoard.sheet.getName()) {
    toDoBoard.updateRowDate(e)
		toDoBoard.organize();
    toDoBoard.genreSetHyperlinks();
  }
  
  // Long term edits
  if (projectSpreadsheet.getActiveSheet().getName() == longTerm.sheet.getName())
		longTerm.genreSetHyperlinks();

  // Holiday Prep edits
  if (projectSpreadsheet.getActiveSheet().getName() == holidayPrep.sheet.getName())
		migrateHolidayPrepToTasks();
}

function midnightRun() {
  importLongTerm();
  migrateHolidayPrepToTasks();
	toDoBoard.organize();
}

function importLongTerm() {
}


/***
 * To Do
 * - LongTerm Imports
 *    - Create Project Named Range and update hyperlinks on main page
 *    - Get Genre From Project on Longterm Imports
 *    - Cascade Imports (Might need isTask)
 * - Import Google Doc
 */