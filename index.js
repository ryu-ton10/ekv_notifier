require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
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

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log('data もしくは execute がありません')
    }
  }
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`${interaction.commandName} は見つかりませんでした`)
    return;
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
    }
  }
})

const wedJob = CronJob.from({
  cronTime: '0 0 12 * * 3',
  onTick: () => {
    console.log('start bot');
    loadMembersFromSheet().then(members => {
      if (members.length !== 0) {
        let message = yieldNoticeMessage(members);
        yieldMemberListMessage(members).then(m => {
          message = message + "\n" + m;
          sendMessage(message);
          console.log('sent a message');
        })
      }
    })
  },
  onComplete: () => {
    console.log('completed to send a message')
  },
  start: false,
  timeZone: 'Asia/Tokyo',
})
const satJob = CronJob.from({
  cronTime: '0 0 12 * * 6',
  onTick: () => {
    console.log('start bot');
    loadMembersFromSheet().then(members => {
      if (members.length !== 0) {
        let message = yieldNoticeMessage(members);
        yieldMemberListMessage(members).then(m => {
          message = message + "\n" + m;
          sendMessage(message);
          console.log('sent a message');
        })
      }
    })
  },
  onComplete: () => {
    console.log('completed to send a message')
  },
  start: false,
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

// TODO: 以下の定数のスコープを狭める
let ruleChannel = '';

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
  const sheet = await doc.sheetsById[process.env.MEMBER_LIST_WORKSHEET_ID];
  const rows = await sheet.getRows();

  // 現在の時刻の取得
  const currentDate = new Date(Date.now());
  const year = await currentDate.getFullYear();
  // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
  const month = await String(Number(currentDate.getMonth()) + 1);
  const date = await currentDate.getDate();

  const currentDateString = `${year}${month}${date}`;

  let row = rows.find((r) => r._rawData[3] === currentDateString);
  if (!row) {
    return [];
  }
  // NOTE: 日付の列を除いた 2 列目からの参加者情報を取得する
  let members = row._rawData.slice(5);
  ruleChannel = row._rawData[4];
  return members
}

/**
 * yieldMessage
 * 取得したメンバーを基にメッセージを生成する
 *
 * @param members string
 * @return string 実際に送信するメッセージ内容
 */
function yieldNoticeMessage(members) {
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
function sendMessage(message) {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  channel.send(message);
}