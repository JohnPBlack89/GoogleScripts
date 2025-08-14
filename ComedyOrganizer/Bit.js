class Bit {
	constructor(sheet) {
		this.sheet = sheet;
		this.titleRow = 1;
	}

	getName() {
		if (this.nameCache != null) return this.nameCache;
		this.nameCache = this.sheet.getName();
		return this.nameCache;
	}

	get name() {
		return this.getName();
	}

	/**
	 * Checks whether or not this bit has been updated in the bitList sheet
	 *
	 * @returns true|false
	 */
	isUpdated() {
		if (this.updatedCache != null) return this.updatedCache;
		if (this.bitListRowNumber == null) return false;

		var ud = this.updatedDate;
		var bitListUpdatedDate = 0;
		return ud == bitListUpdatedDate;
	}

	get updated() {
		return this.isUpdated();
	}

	getUpdatedDate() {
		var titleRow = this.titleRow;
		var rt = getRichTextToRightOfValue(
			this.sheet,
			"Last Updated:",
			this.titleRow
		);
		return rt;
	}

	get updatedDate() {
		return this.getUpdatedDate();
	}

	/***
	 * Finds which row the bit is at on the bitListSheet
	 *
	 * @returns {number}
	 */
	getBitListRowNumber() {
		if (this.bitListRowNumberCache != null) return this.bitListRowNumberCache;

		var lastRow = bitListSheet.getLastRow();
		var rowValues = bitListSheet.getRange(1, 1, lastRow, 1).getValues();

		for (let i = 0; i < rowValues.length; i++) {
			if (rowValues[i][0] == this.name) {
				this.bitListRowNumberCache = i + 1;
				return this.bitListRowNumberCache;
			}
		}
		return null;
	}

	get bitListRowNumber() {
		return this.getBitListRowNumber();
	}

	getBitRowDetails() {
		var row = [];
		var headerMap = getHeaderMap(bitListSheet);
		for (var header in headerMap) row.push(getBitColumnRouter(sheet, header));

		return row;
	}

	getBitColumnRouter(sheet, columnName) {
		// Name
		if (columnName == commonNames.bitName) return getBitNameCell(sheet);

		// Project
		if (columnName == commonNames.projectColumnName)
			return getProjectCell(sheet);

		// "Best/Worst Columns" (Quality, Step)
		if (columnName == commonNames.bestQuality)
			return getMostCellInColumn(sheet, "quality", "Best");

		if (columnName == commonNames.worstQuality)
			return getMostCellInColumn(sheet, "quality", "Worst");

		if (columnName == commonNames.bestStep)
			return getMostCellInColumn(sheet, "step", "Best");

		if (columnName == commonNames.worstStep)
			return getMostCellInColumn(sheet, "step", "Worst");

		// "Total" Columns (Links w/, Topics, Performances, Tech Used)
		if (columnName == commonNames.linkColumn)
			return getTotaledColumn(sheet, columnName, commonNames.linkNamedRange);

		if (columnName == commonNames.techColumn)
			return getTotaledColumn(sheet, columnName, commonNames.techNamedRange);

		if (columnName == commonNames.topicColumn)
			return getTotaledColumn(sheet, columnName, commonNames.topicNamedRange);

		if (columnName == commonNames.performanceColumn)
			return getTotaledColumn(
				sheet,
				columnName,
				commonNames.performanceNamedRange
			);

		if (columnName == commonNames.currentColumn)
			return getCheckboxValue(sheet.getName(), commonNames.currentColumn);

		// If column name isn't found, return empty richtext value
		return emptyRichText;
	}

	getBitNameCell(sheet) {
		return SpreadsheetApp.newRichTextValue()
			.setText(sheet.getName())
			.setLinkUrl("#gid=" + sheet.getSheetId())
			.build();
	}

	getProjectCell(sheet) {
		Logger.log(`Start getProjectCell for ${sheet.getName()}`);
		var richText = getRichTextToRightOfValue(sheet, commonNames.projectCell, 1);

		if (richText == null) return emptyRichText;

		Logger.log(`Project is ${richText.getText()}`);
		return getNamedRangeHyperLinks(
			richText.getText(),
			commonNames.projectNamedRange
		);
	}

	getCheckboxValue(rowHeader, colHeader) {
		Logger.log(`Start getCheckboxValue of ${colHeader} for ${rowHeader}`);
		const data = bitListSheet.getDataRange().getValues();

		// Find row index based on first column
		const rowIndex = data.findIndex((row) => row[0] === rowHeader);
		if (rowIndex === -1)
			return SpreadsheetApp.newRichTextValue().setText("").build();

		// Find column index based on first row
		const colIndex = data[0].indexOf(colHeader);
		if (colIndex === -1) throw new Error("Column header not found");

		// Get the checkbox value
		const cellValue = data[rowIndex][colIndex];
		Logger.log(`Checkbox value at (${rowHeader}, ${colHeader}): ${cellValue}`);
		return SpreadsheetApp.newRichTextValue().setText(cellValue).build();
	}

	getMostCellInColumn(sheet, columnPrefix, operator) {
		Logger.log(
			`Start getMostCellInColumn ${operator} for ${columnPrefix} for ${sheet.getName()}`
		);
		var columnRange = getRangeFromColumn(
			sheet,
			commonNames[columnPrefix + "Column"]
		);
		if (columnRange == null) return emptyRichText;

		let resultString = "";

		columnRange.sort({ column: columnRange.getColumn(), ascending: true });
		const values = columnRange.getValues().flat(); // Flatten to 1D array

		if (operator == operatorStrings.worst)
			resultString = values[values.length - 1];

		if (operator == operatorStrings.best) resultString = values[0];
		var richText = getNamedRangeHyperLinks(
			resultString,
			commonNames[columnPrefix + "NamedRange"]
		);
		Logger.log(`getMostCellInColumn ${richText.getText()}`);
		return richText;
	}

	getTotaledColumn(sheet, columnName, namedRange) {
		var range = getRangeFromColumn(sheet, columnName);
		if (range == null) return emptyRichText;
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
