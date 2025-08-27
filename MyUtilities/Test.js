function test() {
  Logger.log("Started Test");
  var longTerm = new ToDoList("Copy of Long-Term", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 1);
  var toDoBoard = new ToDoList("Copy of Tasks", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 2);

  toDoBoard.importGoogleDoc("https://docs.google.com/document/d/1YkWoXNpykBj1SVmsokTsZkZlph6IA2d7LIiNXPyRJvY/edit?tab=t.k25m12dlba3u");

  // var music = new ToDoList("Copy of Tasks", SpreadsheetApp.openById("1zAqOoMsuAuehrwDKk9lwnCp2-Px5sHAYUF1e9gGltTw"), 1);
  // var holidayPrep = new ToDoList("Copy of Holiday Prep", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 1);
  
  /*
  for(var projectNumber in longTerm.projectRichTextValues) {
    var link = longTerm.projectRichTextValues[projectNumber][0].getLinkUrl();
    if(link == null)
      continue;
    
    // Check if "Active" column is check- if not, don't import
    var projectActive = longTerm.activeValues[projectNumber][0];
    if(!projectActive)
      continue;
    
    toDoBoard.syncWithUrl(link);
  } */
}