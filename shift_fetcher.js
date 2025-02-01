require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function getRows() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsById[process.env.MEMBER_LIST_WORKSHEET_ID];
  const rows = await sheet.getRows();
  return rows
}

/**
 * loadMembersFromSheet
 * スプレッドシートから自身の参加日を取得する
 *
 * @param rows string[]
 * @param userId string
 * @param year number
 * @param month number
 * @return string 参加予定日を含めたメッセージ
*/
function loadShiftFromSheet(rows, userId, year, month) {
  let filteredRows = rows.filter((r) => r._rawData[0] === year && r._rawData[1] === month);

  let shiftDates = []
  if (filteredRows._rawData.includes(userId)) {
    shiftDates.push(filteredRows._rawData)
  }
  if (shiftDates.length === 0) {
    return '指定した月の参加予定日は、ありません。'
  }
  let message = '====='
  for (dates of shiftDates) {
    message = message + `${dates[0]}年${dates[1]}月${dates[2]}日\n`
  }
  message = message + '====='
  return message
}

module.exports = { getRows, loadShiftFromSheet }