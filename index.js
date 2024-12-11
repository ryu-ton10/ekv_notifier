require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const CronJob = require('cron').CronJob;

const client = new Client(
  { intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
    ]
  }
);

const wedJob = new CronJob({
  cronTime: '0 12 * * 3',
  onTick: () => {
    console.log('start bot');
    loadMembersFromSheet().then(members => {
      if (members.length !== 0) {
        const message = yieldMessage(members);
        sendMessage(message);
        console.log('sent a message');
      }
    })
  },
  start: true,
  timeZone: 'Asia/Tokyo',
})
const satJob = new CronJob({
  cronTime: '0 12 * * 6',
  onTick: () => {
    console.log('start bot');
    loadMembersFromSheet().then(members => {
      if (members.length !== 0) {
        const message = yieldMessage(members);
        sendMessage(message);
        console.log('sent a message');
      }
    })
  },
  start: true,
  timeZone: 'Asia/Tokyo',
})

client.on('messageCreate', message => {
  if (message.author.bot) return; //BOTのメッセージには反応しない

  if (message.content === "こんにちは") {
    message.channel.send("こんにちは！");
  }
  if (message.content === "stop bot") {
    wedJob.stop();
    satJob.stop();
    message.channel.send("stopped cron jobs");
  }
  if (message.content === "restart bot") {
    wedJob.start();
    satJob.start();
    message.channel.send("started cron jobs");
  }
});

client.on('ready', () => {
  console.log('ready to send');
  wedJob.start();
  satJob.start();
  console.log('cron job start');
});
client.login(process.env.TOKEN);

/**
 * loadMembersFromSheet
 * スプレッドシートから参加メンバーを取得する
 *
 * @return string[] 参加メンバーの一覧
*/
async function loadMembersFromSheet() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  });

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsById[process.env.WORKSHEET_ID];
  const rows = await sheet.getRows();

  // 現在の時刻の取得
  const currentDate = new Date(Date.now());
  const year = await currentDate.getFullYear();
  // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
  const month = await String(Number(currentDate.getMonth()) + 1);
  const date = await currentDate.getDate();

  const currentDateString = `${year}${month}${date}`;

  let row = rows.find((r) => r._rawData[0] === currentDateString);
  if (!row) {
    return [];
  }
  // NOTE: 日付の列を除いた 2 列目からの参加者情報を取得する
  let members = row._rawData.slice(1);
  return members
}

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
function yieldMessage(members) {
  let message = '';
  // 各メンバーへのメンションメッセージを組み立てる
  for (const member of members) {
    message = message + '<@' + member + '> ';
  }
  message = message + "\n本日は EKV マリカです！参加者とルールを確認しましょう〜。\n配信枠がある方は <#1127915567232327740> に URL を貼ってください！"
  return message;
}

/**
 * sendMessage
 * 指定したチャンネルにメッセージを送信する
 *
 * @param message string
 */
function sendMessage(message) {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  channel.send(message);
}