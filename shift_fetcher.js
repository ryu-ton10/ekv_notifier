require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

/**
 * loadMembersFromSheet
 * スプレッドシートから参加メンバーを取得する
 *
 * @return string[] 参加メンバーの一覧
*/
export async function loadShiftFromSheet(userId, year, month) {
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

  let filteredRows = rows.find((r) => {
    if (r._rawData[0] === year && r._rawData[1] === month) {
      return r
    }
  });

  let shiftDates = []
  for (fr of filteredRows) {
    if (fr.some(userId)) {
      shiftDates.push(fr)
    }
  }
  if (shiftDates.length === 0) {
    return '指定した月の参加予定日は、ありません。'
  }
  let message = ''
  for (dates of shiftDates) {
    message = message + `${shiftDates._rawData[0]}年${shiftDates._rawData[1]}月${shiftDates._rawData[2]}日\n`
  }
  return message
}