import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import 'dotenv/config'

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