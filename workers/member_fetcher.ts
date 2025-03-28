require('dotenv').config()
import { GoogleSpreadsheet } from "google-spreadsheet";
import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from 'google-auth-library'

export type MembersAndRule = {
  members: string[];
  rule: string;
}

/**
 * loadMembersFromSheet
 * スプレッドシートから参加メンバーを取得する
 *
 * @return string[] 参加メンバーの一覧
*/
export async function loadMembersFromSheet(): Promise<MembersAndRule> {
  const result = {
    members: [] as string[],
    rule: ''
  }
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const sheetId: string = process.env.SPREADSHEET_ID ?? ''
  const worksheetId: string = process.env.MEMBER_LIST_WORKSHEET_ID ?? ''
  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsById[Number(worksheetId)];
  const rows = await sheet.getRows();

  // 現在の時刻の取得
  const currentDate = new Date(Date.now());
  const year = await currentDate.getFullYear();
  // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
  const month = await String(Number(currentDate.getMonth()) + 1);
  const date = await currentDate.getDate();

  const currentDateString = `${year}${month}${date}`;

  const row = rows.find((r: GoogleSpreadsheetRow) => r.get('date') === currentDateString);
  if (!row) {
    return result;
  }
  // NOTE: 日付の列を除いた 2 列目からの参加者情報を取得する
  for ( let i = 0; i < 12; i++ ) {
    result.members.push(row.get(String(i)))
  }
  result.rule = row.get('rule');
  return result
}