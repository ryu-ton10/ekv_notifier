require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

/**
 * loadMembersFromSheet
 * スプレッドシートから参加メンバーを取得する
 *
 * @return string[] 参加メンバーの一覧
*/
async function loadMembersFromSheet() {
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

  // 現在の時刻の取得
  const currentDate = new Date(Date.now());
  const year = await currentDate.getFullYear();
  // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
  const month = await String(Number(currentDate.getMonth()) + 1);
  const date = await currentDate.getDate();

  const currentDateString = `${year}${month}${date}`;

  let row = rows.find((r) => r._rawData[3] === currentDateString);
  if (!row) {
    return [];
  }
  // NOTE: 日付の列を除いた 2 列目からの参加者情報を取得する
  const members = row._rawData.slice(5);
  const rule = row._rawData[4];
  return {members, rule}
}

module.exports = { loadMembersFromSheet }