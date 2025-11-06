function myFunction() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const tables = sheet.getTables();
  const table = tables[0]; 
}
