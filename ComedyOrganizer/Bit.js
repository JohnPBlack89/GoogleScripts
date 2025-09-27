class Bit extends MyUtilities.TableContext {
	constructor(range, titleRow = 1) {
    super(range, titleRow);
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

  //
  getBitTable() {
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


  getProjectRichTextValue() {
		Logger.log(`Start getProjectRichTextValue for ${this.sheet.getName()}`);
		var richText = getRichTextToRightOfValue(this.sheet, projectCell, 1);

		if (richText == null) return emptyRichText;

		Logger.log(`Project is ${richText.getText()}`);
		return getNamedRangeHyperLinks(
			richText.getText(),
			projectNamedRange
		);
	}

  get project() {
    return this.getProjectRichTextValue()
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
