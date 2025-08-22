var ss = SpreadsheetApp.getActiveSpreadsheet();
var currentBit = {};
var bitListSheetName = ".Bit List";
var bitList = new BitList(ss,1);

function arrangeBitList() {
	MyUtilities.sortSheetsAlphabetically(ss);
	// checkBitListRows();
}

var operatorStrings = {
	best: "Best",
	worst: "Worst",
};

var lastUpdatedString = "Last Updated:"

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function isBit(sheetName) {
  var color = ss.getSheetByName(sheetName).getTabColorObject();
  if(color == green)
    return true;

	return !/^[^a-zA-Z]/.test(sheetName);
}

function test() {
  bitList.update();
}