import type { GoogleSpreadsheetRow } from "google-spreadsheet";
import 'dotenv/config'
import { fetchRowsFromSheet } from './spreadsheetWorker.ts';

export type MembersAndRule = {
  members: string[];
  rule: string;
}

type GameMaster = {
  name: string;
  discordId: string;
  twitter: string;
  youtube: string;
  youtubeId: string;
}

type Member = {
  name: string;
  discordId: string;
  twitter: string;
  youtube: string;
  youtubeId: string;
}

/**
 * loadMembersFromSheet
 * スプレッドシートから参加メンバーを取得する
 *
 * @return string[] 参加メンバーの一覧
*/
export const loadMembersFromSheet = async (): Promise<MembersAndRule> => {
  const result = {
    members: [] as string[],
    rule: ''
  }
  const memberListSheetId: string = process.env.MEMBER_LIST_WORKSHEET_ID ?? ''

  const rows = await fetchRowsFromSheet(Number(memberListSheetId));
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

/**
 * fetchGameMaster
 * 主催者の情報を取得する
 *
 * @return Promise<GameMaster>
 */
export const fetchGameMaster = async (): Promise<GameMaster> => {
  const gm: GameMaster = {
    name: '',
    discordId: '',
    twitter: '',
    youtube: '',
    youtubeId: ''
  };

  const gameMasterSheetId = process.env.GAME_MASTER_WORKSHEET_ID ?? ''

  const rows = await fetchRowsFromSheet(Number(gameMasterSheetId));
  gm.name = rows[0].get('name');
  gm.discordId = rows[0].get('discordId');
  gm.twitter = rows[0].get('twitter');
  gm.youtube = `https://www.youtube.com/channel/${rows[0].get('youtubeId')}`;
  gm.youtubeId = rows[0].get('youtubeId');

  return gm;
}

/**
 * fetchMember
 * ID を元にメンバーの情報を取得する
 *
 * @return Promise<Member>
 */
export const fetchMember = async (memberId: string): Promise<Member> => {
  const memberMasterSheetId = process.env.MEMBER_MASTER_WORKSHEET_ID ?? ''
  const member: Member = {
    name: '',
    discordId: '',
    twitter: '',
    youtube: '',
    youtubeId: ''
  };

  await fetchRowsFromSheet(Number(memberMasterSheetId)).then(rows => {
    rows.filter((r) => {
      if (r.get('discordId') === memberId) {
        member.name = r.get('name');
        member.discordId = r.get('discordId');
        member.twitter = r.get('twitter');
        member.youtube = `https://www.youtube.com/channel/${r.get('youtubeId')}`;
        member.youtubeId = r.get('youtubeId');
      }
    })
  })

  return member;
}