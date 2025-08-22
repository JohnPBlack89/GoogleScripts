function test() {
  Logger.log("Started Test");
  var longTerm = new ToDoList("Copy of Long-Term", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 1);
  var toDoBoard = new ToDoList("Copy of Tasks", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 2);
  // var music = new ToDoList("Copy of Tasks", SpreadsheetApp.openById("1zAqOoMsuAuehrwDKk9lwnCp2-Px5sHAYUF1e9gGltTw"), 1);
  // var holidayPrep = new ToDoList("Copy of Holiday Prep", SpreadsheetApp.openById("1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE"), 1);
  
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
}

/***
 * To Do
 * - syncWithUrl
 *     Cascade Imports (Might need isTask)
 *     Import Google Doc
 * - Refactor
 *    Batch Update
 *    Copy RichText Formatting (Background and text colors mostly)
 */
