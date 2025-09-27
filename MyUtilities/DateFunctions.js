/**
 * Returns the whole number value of a date, when passed a date value (in milliseconds)
 *
 * @param {number} date A date given in milliseconds
 * @returns {number} day The whole number value of a day
 */
function getDateAsNumber(date) {
	return Math.trunc(date / (1000 * 60 * 60 * 24));
}

/**
 * Returns the number of days between two dates as an integer
 */
function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;

  const diffInMs = end - start;
  const diffInDays = Math.round(diffInMs / msPerDay);

  return diffInDays;
}


/**
 * Highlights the cell based on its date value
 */

const dateColors = {
  pastDateBackgroundColor1 : "#990000",
  pastDateBackgroundColor2 : "#660000",
  todayBackgroundColor1 : "#bf9000",
  todayBackgroundColor2 : "#7f6000",
  nearDateBackgroundColor1 : "#38761d",
  nearDateBackgroundColor2 : "#274e13"
}

function highlightDate(dateCell) {
  var daysAhead = daysUntilDate(dateCell);

  var colorAddition = dateCell.getRow % 2 + 1;
  var colorAdditionString = colorAddition.toString();


  if (daysAhead < 0) {
      dateCell.setBackground(
        dateColors["pastDateBackgroundColor" + colorAdditionString]);
    } else if (daysAhead === 0) {
      dateCell.setBackground(
        dateColors["todayBackgroundColor" + colorAdditionString]);
    } else if (daysAhead <= warningDateDaysAhead) {
      dateCell.setBackground(
        dateColors["nearDateBackgroundColor" + colorAdditionString]);
  }
}