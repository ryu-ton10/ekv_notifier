import type { BaseGuildTextChannel, Client } from 'discord.js';
import type { MembersAndRule } from './member_fetcher';
import type { VideoUrl } from './streamFetcher';
import 'dotenv/config'
import { fetchRowsFromSheet } from './spreadsheet_worker';

type GameMaster = {
  name: string;
  discordId: string;
  twitter: string;
  youtube: string;
  channelId: string;
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
    // メンバーが 12 人以下のケースを考慮している
    if (member === "#N/A") {
      continue;
    }
    message = `${message}<@${member}> `;
  }
  const gm = await fetchGameMaster();
  message = `${message}<@${gm.discordId}>`

  message = `${message}\n本日は EKV マリカです！参加者とルールを確認しましょう。\n本日のルールは <#${membersAndRule.rule}> です！\n配信枠がある方は <#1127915567232327740> に URL を貼ってください！`
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
  const memberMasterSheetId = process.env.MEMBER_MASTER_WORKSHEET_ID ?? ''

  const memberRows = await fetchRowsFromSheet(Number(memberMasterSheetId));
  const gm = await fetchGameMaster();
  let text = "\n以下は本日の参加者のリンク一覧です。概要欄などにご活用ください。\n----------------------------------\n参加者一覧（順不同・敬称略）\n\n";
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
 * yieldStreamListMessage
 * 開始前のメンバーの EKV 配信枠一覧を生成する
 *
 * @param urls: VideoUrl[]
 * @return string
 */
export function yieldStreamListMessage(urls: VideoUrl[]): string {
  let text = ''
  text = `${text}----------------------------------\n`
  text = `${text}現時点で立てられている本日の EKV 配信枠をご案内します。\n\n`
  for (const u of urls) {
    text = `${text}【${u.name}】\n${u.url}\n\n`
  }
  text = `${text}----------------------------------`
  return text
}

/**
 * sendMessage
 * 指定したチャンネルにメッセージを送信する
 *
 * @param message string
 * @param client Client
 */
export function sendMessage(channelId: string, message: string, client: Client) {
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
export async function fetchGameMaster(): Promise<GameMaster> {
  const gm: GameMaster = {
    name: '',
    discordId: '',
    twitter: '',
    youtube: '',
    channelId: ''
  };

  const gameMasterSheetId = process.env.GAME_MASTER_WORKSHEET_ID ?? ''

  const rows = await fetchRowsFromSheet(Number(gameMasterSheetId));
  gm.name = rows[0].get('name');
  gm.discordId = rows[0].get('discordId');
  gm.twitter = rows[0].get('twitter');
  gm.youtube = rows[0].get('youtube');
  gm.channelId = rows[0].get('channelId');
  return gm;
}