/**
 * Validates that the provided Range object refers to exactly one cell.
 * Throws an error if the range spans more than one row or column.
 *
 * @param {Range} range - The Range object to validate.
 * @throws {Error} If the range is not a single cell.
 */
function assertSingleCell(range) {
	if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) {
		throw new Error(
			`Expected a single cell, but got a range of ${range.getNumRows()} rows and ${range.getNumColumns()} columns.`
		);
	}
}
/**
 * Validates that the provided parameter is a Spreadsheet object.
 *
 * @param {Spreadsheet} spreadsheet - The Spreadsheet object to validate.
 * @throws {Error} If the spreadsheet is not a Spreadsheet.
 */
function assertSpreadsheet(spreadsheet){
  if (Object.prototype.toString.call(spreadsheet) === "[object Spreadsheet]")
			throw new Error(
				"Must pass a Spreadsheet object to function"
			);
}

function assertToDoList(toDoList) {
		if (typeof toDoList == "string") toDoList = new ToDoList(toDoList, 1);

		if (!(toDoList instanceof ToDoList))
			throw new Error(
				"Must pass either a string or ToDoList object to function importSheet(toDoList)"
			);
    
    return toDoList;
}