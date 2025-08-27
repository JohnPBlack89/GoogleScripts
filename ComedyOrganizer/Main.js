var ss = SpreadsheetApp.getActiveSpreadsheet();
var currentBit = {};
var bitListSheetName = ".Bit List";
var bitList = new BitList(ss);

var operatorStrings = {
	best: "Best",
	worst: "Worst",
};

var lastUpdatedString = "Last Updated:"

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function isBit(sheetName) {
	return !/^[^a-zA-Z]/.test(sheetName);
}

function test() {
  bitList.update();
}

function sort() {
  MyUtilities.sortSheetsAlphabetically(ss);
}