var ss = SpreadsheetApp.getActiveSpreadsheet();
var currentBit = {};
var bitListSheet = ss.getSheetByName(".Bit List");

function arrangeBitList() {
	sortSheets();
	checkBitListRows();
}

/**
 * Runs over every sheet and compares the contents in them vs the contents on the Bit List sheet
 */
function checkBitListRows() {
	var sheets = ss.getSheets();

	sheets.forEach(function (sheet) {
		if (!isBit(sheet.getName())) return;

		var row = new BitRow(sheet);

		if (!row.isUpdated()) return;

		// range.setRichTextValues(summaryData);
	});
}

function test() {
  var sheet = ss.getSheetByName("ADHD at 30");
  var bit = new Bit(sheet);
  var u = bit.updatedOn;
  debugger;
}
