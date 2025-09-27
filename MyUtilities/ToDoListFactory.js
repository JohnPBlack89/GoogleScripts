var taskSheetNames = ["Tasks", "To-Do"];

var ToDoListFactory = class ToDoListFactory {
  constructor() {
    this.toDoLists = {};
  }

  /**
   * Creates a ToDoList from a passed url
   */
  create(url) {
    if(url == null)
          return;

    if(isGoogleSheetReference(url)) {
      return this.createFromSpreadsheet(getSpreadsheetFromUrl(url))
    }

    if(isGoogleDocReference(url))
      return this.createFromGoogleDoc(url);
  }

  /**
   * Creates a ToDoList from a passed spreadsheet
   */
  createFromSpreadsheet(spreadsheet) {
		assertSpreadsheet(spreadsheet);

    const spreadsheetSheetNames = spreadsheet
			.getSheets()
			.map((sheet) => sheet.getName());

		var taskSheetName = taskSheetNames.filter((name) =>
			spreadsheetSheetNames.includes(name)
		);

		if (!taskSheetName) return;
		
    return this.createFromSheet(taskSheetName[0], spreadsheet);
	}

  /**
   * Creates a ToDoList from a passed Google Sheet
   */
  createFromSheet(sheet = SpreadsheetApp.getActiveSheet(), spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRow = 1) {
    assertSpreadsheet(spreadsheet);

    if(typeof sheet == "string")
      sheet = spreadsheet.getSheetByName(sheet);

    var listName = sheet.getName();
    if (this.toDoLists[listName]) return this.toDoLists[listName];

    var range = sheet.getRange(titleRow, 1, sheet.getLastRow(), sheet.getLastColumn());
    var list = new ToDoList(range);
    list.titleRow = titleRow;
    this.toDoLists[listName] = list;
    return this.toDoLists[listName];
  }

  /**
   * Creates a ToDoList from a passed url to a Google Doc
   */
  createFromGoogleDoc(url) {
    var doc = DocumentApp.openByUrl(url);
		var table = getGoogleDocTable(doc);
    var list = new GoogleSheetToDoList(table);
    var listName = doc.getName();

    this.toDoLists[listName] = list;
    return this.toDoLists[listName];
  }
}