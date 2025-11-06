var emptyRichText = emptyRichText;
var ss = getSpreadsheetFromUrl("https://docs.google.com/spreadsheets/d/10bUAIaZIKtMXVUPhzWHPXmhODrs8goYhA9hZp_Wpjss/edit?gid=1173765681#gid=1173765681");


function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

function midnightRun() {
  var range = ss.getSheetByName(bitListSheetName).getDataRange();
  var bitList = new BitList(ss, range, 2);
  console.log("Midnight Run Started");
  // MyUtilities.sortSheetsAlphabetically(ss);
  bitList.update();
  // Headers Problems
}