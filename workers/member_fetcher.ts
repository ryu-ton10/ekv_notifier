import { GoogleSpreadsheet } from "google-spreadsheet";
import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from 'google-auth-library'
import 'dotenv/config'

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
  const year = currentDate.getFullYear();
  // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
  const month = String(Number(currentDate.getMonth()) + 1);
  const date = currentDate.getDate();

  const row = rows.filter((r: GoogleSpreadsheetRow) => {
    return r.get('year') === String(year)
  }).filter((r: GoogleSpreadsheetRow) => {
    return r.get('month') === String(month)
  }).find((r: GoogleSpreadsheetRow) => {
    return r.get('day') === String(date)
  })

  if (!row) {
    return result;
  }

  for ( let i = 0; i < 12; i++ ) {
    result.members.push(row.get(String(i)))
  }

  result.rule = row.get('rule');
  return result;
}