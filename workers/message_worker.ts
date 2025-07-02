import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import type { BaseGuildTextChannel, Client } from 'discord.js';
import type { MembersAndRule } from './member_fetcher';
import 'dotenv/config'

type GameMaster = {
  name: string;
  discordId: string;
  twitter: string;
  youtube: string;
}

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
export async function yieldNoticeMessage(membersAndRule: MembersAndRule): Promise<string> {
  let message = '';
  // 各メンバーへのメンションメッセージを組み立てる
  for (const member of membersAndRule.members) {
    message = `${message}<@${member}> `;
  }
  const gm = await fetchGameMaster();
  message = `${message}<@${gm.discordId}>`

  message = `${message}\n本日は EKV マリカです！参加者とルールを確認しましょう〜。\n本日のルールは <#${membersAndRule.rule}> です！\n配信枠がある方は <#1127915567232327740> に URL を貼ってください！`
  return message;
}

/**
 * yieldMemberListMessage
 * 取得したメンバーを基に参加者の URL 一覧表を作成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
export async function yieldMemberListMessage(members: string[]): Promise<string> {
  const sheetId = process.env.SPREADSHEET_ID ?? ''
  const worksheetId = process.env.MEMBER_MASTER_WORKSHEET_ID ?? ''
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  const memberMasterSheet = await doc.sheetsById[Number(worksheetId)];
  const memberRows = await memberMasterSheet.getRows();

  const gm = await fetchGameMaster();
  let text = "\n以下は本日の参加者のリンク一覧です。概要欄などにご活用ください。\n----------------------------------\n";
  text = `${text} ☆主催☆【${gm.name}】\n<${gm.twitter}>\n<${gm.youtube}>\n\n`;
  for (const r of memberRows) {
    for (const m of members) {
      if (r.get('discordId') === m) {
        text = `${text}【${r.get('name')}】\n<${r.get('twitter')}>\n<${r.get('youtube')}>\n\n`;
      }
    }
  }
  text = `${text}----------------------------------`
  return text;
}

/**
 * sendMessage
 * 指定したチャンネルにメッセージを送信する
 *
 * @param message string
 * @param client Client
 */
export function sendMessage(message: string, client: Client) {
  const channelId = process.env.CHANNEL_ID ?? ''
  const channel = client.channels.cache.get(channelId) as BaseGuildTextChannel;
  if (!channel) return
  channel.send(message);
}

/**
 * fetchGameMaster
 * 主催者の情報を取得する
 *
 * @return Promise<GameMaster>
 */
async function fetchGameMaster(): Promise<GameMaster> {
  const gm: GameMaster = {
    name: '',
    discordId: '',
    twitter: '',
    youtube: ''
  };

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const sheetId = process.env.SPREADSHEET_ID ?? ''
  const gameMasterSheetId = process.env.GAME_MASTER_WORKSHEET_ID ?? ''
  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsById[Number(gameMasterSheetId)];
  const rows = await sheet.getRows();

  gm.name = rows[0].get('name');
  gm.discordId = rows[0].get('discordId');
  gm.twitter = rows[0].get('twitter');
  gm.youtube = rows[0].get('youtube');
  return gm;
}