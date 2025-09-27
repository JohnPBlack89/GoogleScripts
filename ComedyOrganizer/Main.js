var ss = SpreadsheetApp.getActiveSpreadsheet();
var bitList = new BitList(ss, bitListSheetName, 2);

var emptyRichText = MyUtilities.emptyRichText;

function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

function midnightRun() {
  bitList.update();
  // Headers Problems
}