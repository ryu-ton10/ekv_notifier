require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')

// TODO: 以下の定数のスコープを狭める
let ruleChannel = '';

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
function yieldNoticeMessage(members, ruleChannel) {
  let message = '';
  // 各メンバーへのメンションメッセージを組み立てる
  for (const member of members) {
    message = message + '<@' + member + '> ';
  }
  message = message + "\n本日は EKV マリカです！参加者とルールを確認しましょう〜。\n本日のルールは <#" + ruleChannel + "> です！\n配信枠がある方は <#1127915567232327740> に URL を貼ってください！"
  return message;
}

/**
 * yieldMemberListMessage
 * 取得したメンバーを基に参加者の URL 一覧表を作成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
async function yieldMemberListMessage(memberIds) {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const memberMasterSheet = await doc.sheetsById[process.env.MEMBER_MASTER_WORKSHEET_ID];
  const memberRows = await memberMasterSheet.getRows();

  let text = "\n以下は本日の参加者のリンク一覧です。概要欄などにご活用ください。\n----------------------------------\n";
  for (const r of memberRows) {
    for (const m of memberIds) {
      if (r._rawData[1] === m) {
        text = text + "【" + r._rawData[0] + "】\n<" + r._rawData[2] + ">\n<" + r._rawData[3] + ">\n\n";
      }
    }
  }
  text = text + "----------------------------------"
  return text;
}

/**
 * sendMessage
 * 指定したチャンネルにメッセージを送信する
 *
 * @param message string
 */
function sendMessage(message, client) {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  channel.send(message);
}

module.exports = { yieldNoticeMessage, yieldMemberListMessage, sendMessage }