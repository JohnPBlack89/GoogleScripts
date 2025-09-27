var operatorStrings = {
	best: "Best",
	worst: "Worst",
};

class BitContext extends MyUtilities.TableContext {
	constructor(bitName, spreadsheet, titleRow = 1) {
    var sheet = spreadsheet.getSheetByName(bitName);
    var range = sheet.getRange(titleRow, 1, sheet.getLastRow(), sheet.getLastColumn());

    super(range, titleRow);
    this.sheet = sheet;
	}

  // Returns the name of the bit (taken from the bit sheet)
	getName() {
		if (this.nameCache != null) return this.nameCache;
		this.nameCache = this.sheet.getName();
		return this.nameCache;
	}

	get name() {
		return this.getName();
	}

  // Gets just the upper table on the sheet (decided by dropdowns in "topics" column)
  getBitTable() {
    var tables = this.sheet.getTables();

    var t = tables[0];

    if (this.tasksTableCache != null) return this.tasksTableCache;

    this.tasksTableCache = this.sheet.getRange(
        this.titleRow + 1,
        1,
        getLastDropdown(this.sheet,"Topics"),
        this.lastColumn
    );

    return this.tasksTableCache;
  }

  get table() {
    return this.getBitTable();
  }

  // 
	getBitNameRichTextValue() {
		return SpreadsheetApp.newRichTextValue()
			.setText(this.name)
			.setLinkUrl("#gid=" + this.sheet.getSheetId())
			.build();
	}

  get nameRTV() {
    return this.getBitNameRichTextValue();
  }

  getUpdatedOn() {
    var updatedIndex =  this.row(0).getValues().flat().findIndex(item => item instanceof Date);
    if(updatedIndex == -1) updatedIndex = this.headerLength + 1;
    return this.sheet.getRange(this.titleRow, updatedIndex);
  }

  get updated() {
    return this.getUpdatedOn();
  }

  getTotaledColumn(columnName) {
		const values = range
			.getValues()
			.flat()
			.toString()
			.replaceAll(", ", ",")
			.split(","); // Flatten 2D array to 1D

		const uniqueValues = [...new Set(values.filter(String))]; // Remove blanks and deduplicate

		Logger.log(
			"getTotaledColumn Column: " +
				columnName +
				" Sheet: " +
				sheet.getName() +
				" Unique Values: " +
				uniqueValues
		);
		return getNamedRangeHyperLinks(uniqueValues.toString(), namedRange);
	}

  // Gets best/worst in a column
	getMostCellInColumn(columnName, operator) {
		Logger.log(
			`Start getMostCellInColumn ${operator} for ${columnName} for ${this.sheet.getName()}`
		);
		var columnRange = getRangeFromColumn(
			this.sheet,
			commonNames[columnPrefix + "Column"]
		);
		if (columnRange == null) return emptyRichText;

		let resultString = "";

		columnRange.sort({ column: columnRange.getColumn(), ascending: true });
		const values = columnRange.getValues().flat();

		if (operator == operatorStrings.worst)
			resultString = values[values.length - 1];

		if (operator == operatorStrings.best) resultString = values[0];
		var richText = getNamedRangeHyperLinks(
			resultString,
			commonNames[columnName + "NamedRange"]
		);

		Logger.log(`getMostCellInColumn ${richText.getText()}`);
		return richText;
	}

	getTotaledColumn(columnName) {
		const values = range
			.getValues()
			.flat()
			.toString()
			.replaceAll(", ", ",")
			.split(","); // Flatten 2D array to 1D

		const uniqueValues = [...new Set(values.filter(String))]; // Remove blanks and deduplicate

		Logger.log(
			"getTotaledColumn Column: " +
				columnName +
				" Sheet: " +
				sheet.getName() +
				" Unique Values: " +
				uniqueValues
		);
		return getNamedRangeHyperLinks(uniqueValues.toString(), namedRange);
	}
}
