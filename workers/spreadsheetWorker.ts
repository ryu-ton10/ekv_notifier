import { JWT } from 'google-auth-library'
import type { GoogleSpreadsheetRow } from 'google-spreadsheet';
import { GoogleSpreadsheet } from 'google-spreadsheet'

/**
 * fetchRowsFromSheet
 * 指定されたスプレッドシートの行情報を全て取得する
 *
 * @param worksheetId 取得したい対象のシートID
 * @return Promise<GoogleSpreadsheetRow<Record<string, any>>[]>
 */
// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
export const fetchRowsFromSheet = async (worksheetId: number): Promise<GoogleSpreadsheetRow<Record<string, any>>[]> => {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const spreadSheetId = process.env.SPREADSHEET_ID ?? ''
  const doc = new GoogleSpreadsheet(spreadSheetId, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsById[worksheetId];
  return await sheet.getRows();
}