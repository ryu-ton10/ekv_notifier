import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import { fetchRowsFromSheet } from "./spreadsheetWorker.ts";
import 'dotenv/config'

/**
 * fetchShift
 * スプレッドシートから自身の参加日を取得する
 *
 * @param year string | null
 * @param month string | null
 * @param userId string | null
 * @return string 参加予定日を含めたメッセージ
 */
export const fetchShift = async (year: string, month: string, userId: string): Promise<string> => {
  const memberListSheetId = process.env.MEMBER_LIST_WORKSHEET_ID ?? ''
  let message = ''
  await fetchRowsFromSheet(Number(memberListSheetId)).then(rows => {
    const shiftDates = filterShift(rows, userId, year, month)
    message = enableShiftMessage(shiftDates)
  })
  return message
}

/**
 * filterShift
 * 取得したスプレッドシートの情報と照合して参加日を精査する
 *
 * @param rows GoogleSpreadsheetRow[]
 * @param userId string
 * @param year string
 * @param month string
 * @return GoogleSpreadsheetRow<Record<string, any>>[] 
 */
// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
const filterShift = (rows: GoogleSpreadsheetRow[], userId: string, year: string, month: string): GoogleSpreadsheetRow<Record<string, any>>[] => {
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
  return shiftDates
}
/**
 * enableShiftMessage
 * 取得した結果をメッセージとして変換する
 *
 * 
 * @param shiftDates GoogleSpreadsheetRow<Record<string, any>>[] 
 * @return string 参加予定日を含めたメッセージ
 */
// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
const enableShiftMessage = (shiftDates: GoogleSpreadsheetRow<Record<string, any>>[]): string => {
  let message = "=====\n"
  if (shiftDates.length === 0) {
    message = `${message}指定した月の参加予定日は、ありません。`
    message = `${message}=====`
    return message
  }
  for (const date of shiftDates) {
    message = `${message}${date.get('year')}年${date.get('month')}月${date.get('day')}日\n`
  }
  message = `${message}=====`
  return message
}