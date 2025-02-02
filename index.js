require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const CronJob = require('cron').CronJob
const { loadMembersFromSheet } = require('./workers/member_fetcher.js')
const { yieldNoticeMessage, yieldMemberListMessage, sendMessage } = require('./workers/message_worker.js')

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