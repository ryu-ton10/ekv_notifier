import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import type { BaseGuildTextChannel, Client } from 'discord.js';
import type { MembersAndRule } from './member_fetcher';
import 'dotenv/config'

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
export function yieldNoticeMessage(membersAndRule: MembersAndRule) {
  let message = '';
  // 各メンバーへのメンションメッセージを組み立てる
  for (const member of membersAndRule.members) {
    message = `${message}<@${member}> `;
  }
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
export async function yieldMemberListMessage(members: string[]) {
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

  let text = "\n以下は本日の参加者のリンク一覧です。概要欄などにご活用ください。\n----------------------------------\n";
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