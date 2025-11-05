var emptyRichText = MyUtilities.emptyRichText;
var ss = SpreadsheetApp.getActiveSpreadsheet();


function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

function midnightRun() {
  var bitList = new BitList(ss, bitListSheetName, 2);
  console.log("Midnight Run Started");
  // MyUtilities.sortSheetsAlphabetically(ss);
  bitList.update();
  // Headers Problems
}