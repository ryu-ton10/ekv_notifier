require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');

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