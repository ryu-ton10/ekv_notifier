import { GoogleSpreadsheet } from 'google-spreadsheet';
import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from 'google-auth-library';
import 'dotenv/config'

/**
 * シートから全ての列情報を取得する
 *
 * @returns GoogleSpreadsheetRow[]
 */
export async function getRows(): Promise<GoogleSpreadsheetRow[]> {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const sheetId = process.env.SPREADSHEET_ID ?? ''
  const worksheetId = process.env.MEMBER_LIST_WORKSHEET_ID ?? ''
  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsById[Number(worksheetId)];
  const rows = await sheet.getRows();
  return rows
}

/**
 * loadMembersFromSheet
 * スプレッドシートから自身の参加日を取得する
 *
 * @param rows GoogleSpreadsheetRow[]
 * @param userId string
 * @param year string
 * @param month string
 * @return string 参加予定日を含めたメッセージ
*/
export function loadShiftFromSheet(rows: GoogleSpreadsheetRow[], userId: string, year: string, month: string): string {
  const filteredRows = rows.filter((r) => r.get('year') === year && r.get('month') === month);

  const shiftDates = []
  for (const fr of filteredRows) {
    for (let i = 0; i < 12; i++) {
      const memberId = fr.get(String(i))
      if (memberId === userId) {
        shiftDates.push(fr)
      }
    }
  }
  if (shiftDates.length === 0) {
    return '指定した月の参加予定日は、ありません。'
  }
  let message = "=====\n"
  for (const date of shiftDates) {
    message = `${message}${date.get('year')}年${date.get('month')}月${date.get('day')}日\n`
  }
  message = `${message}=====`
  return message
}