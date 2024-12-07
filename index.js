require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library')

const client = new Client(
  { intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
    ]
  }
);

client.on('messageCreate', message => {
  if(message.author.bot) return; //BOTのメッセージには反応しない

  if(message.content === "こんにちは") {
    message.channel.send("こんにちは！");
  }
});

client.on('ready', () => {
  console.log('ボットが起動したよ');
});
client.login(process.env.TOKEN);

loadMembersFromSheet();

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
  const sheet = await doc.sheetsById[process.env.DEV_WORKSHEET_ID];
  const rows = await sheet.getRows();

  await console.log(rows)
}