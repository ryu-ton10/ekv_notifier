import type { BaseGuildTextChannel, Client } from 'discord.js';
import type { MembersAndRule } from './memberFetcher.ts';
import type { VideoUrl } from './streamFetcher.ts';
import 'dotenv/config'
import { fetchGameMaster, fetchMember } from './memberFetcher.ts';

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
export const yieldNoticeMessage = async (membersAndRule: MembersAndRule): Promise<string> => {
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

  message = `${message}\n本日は ${membersAndRule.category} マリカです！参加者とルールを確認しましょう。\n本日のルールは <#${membersAndRule.rule}> です！\n配信枠については、配信開始 30 分前に自動的に取得します。`
  return message;
}

/**
 * yieldMemberListMessage
 * 取得したメンバーを基に参加者の URL 一覧表を作成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
export const yieldMemberListMessage = async (members: string[]): Promise<string> => {
  const gm = await fetchGameMaster();
  let text = "\n以下は本日の参加者のリンク一覧です。概要欄などにご活用ください。\n----------------------------------\n参加者一覧（順不同・敬称略）\n\n";
  if (!gm.twitch) {
    text = `${text}【${gm.name}】（主催）\nX : <${gm.twitter}>\nYouTube : <${gm.youtube}>\n\n`;
  } else {
    text = `${text}【${gm.name}】（主催）\nX : <${gm.twitter}>\nYouTube : <${gm.youtube}>\nTwitch : <${gm.twitch}>\n\n`;
  }

  for (const m of members) {
    const member = await fetchMember(m);

    if (member.name === '') {
      continue;
    }

    if (!member.twitch) {
      text = `${text}【${member.name}】\nX : <${member.twitter}>\nYouTube : <${member.youtube}>\n\n`;
      continue;
    }

    text = `${text}【${member.name}】\nX : <${member.twitter}>\nYouTube : <${member.youtube}>\nTwitch : <${member.twitch}>\n\n`;
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
export const yieldStreamListMessage = (urls: VideoUrl[]): string => {
  let text = ''

  text = `${text}----------------------------------\n`
  text = `${text}現時点で立てられている本日の EKV 配信枠をご案内します。\n\n`

  for (const u of urls) {
    text = `${text}【${u.name}】\n<${u.url}>\n\n`
  }

  text = `${text}----------------------------------`
  return text
}

export const raceResultText = (result: []): string => {
  let resultText = ''

  result.map((r: any) => {
    resultText = `${resultText}\n${r.rank} 位 ${r.name}`
  })

  return resultText
}

const DISCORD_MAX_LENGTH = 2000;

const splitMessage = (message: string): string[] => {
  if (message.length <= DISCORD_MAX_LENGTH ) return [message];

  const chunks: string[] = [];
  let remaining = message;

  while (remaining.length > 0) {
    if (remaining.length <= DISCORD_MAX_LENGTH) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = remaining.lastIndexOf("\n", DISCORD_MAX_LENGTH);
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = DISCORD_MAX_LENGTH;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).replace(/^\n/, '');
  }

  return chunks;
}

/**
 * sendMessage
 * 指定したチャンネルにメッセージを送信する
 *
 * @param message string
 * @param client Client
 */
export const sendMessage = async (channelId: string, message: string, client: Client) => {
  const channel = client.channels.cache.get(channelId) as BaseGuildTextChannel;
  if (!channel) return
  console.log("ready to send a message")

  const chunks = splitMessage(message);
  for (const chunk of chunks) {
    await channel.send(chunk);
  }
}
