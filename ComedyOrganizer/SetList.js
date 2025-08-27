class SetList extends MyUtilities.TableContext {
  constructor(setListName, spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		super(setListName, spreadsheet, titleRowNumber);
	}
}
