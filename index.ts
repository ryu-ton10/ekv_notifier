import { Collection } from "discord.js";
import type { CommandInteraction, Message } from "discord.js";
import { loadMembersFromSheet } from "./workers/member_fetcher"
import type { MembersAndRule } from "./workers/member_fetcher"

require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Client, Events, GatewayIntentBits, MessageFlags } = require('discord.js')
const CronJob = require('cron').CronJob
const { yieldNoticeMessage, yieldMemberListMessage } = require('./workers/message_worker.js')

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
  const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'))

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

client.on(Events.InteractionCreate, async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName)

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

const execute = () => {
  loadMembersFromSheet().then((membersAndRule: MembersAndRule) => {
    const members = membersAndRule.members;
    const rule = membersAndRule.rule;
    if (members.length === 0) {
      return;
    }
    let message = yieldNoticeMessage(members, rule);
    yieldMemberListMessage(members).then((m: string) => {
      message = `${message}\n${m}`;
      //sendMessage(message, client);
      console.log('sent a message');
    })
  })
}

const wedJob = CronJob.from({
  cronTime: '0 0 12 * * 3',
  onTick: () => {
    console.log('start bot');
    execute();
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
    execute();
  },
  onComplete: () => {
    console.log('completed to send a message')
  },
  start: false,
  timeZone: 'Asia/Tokyo',
})

client.on('messageCreate', (message: Message) => {
  if (message.author.bot) return; //BOTのメッセージには反応しない

  if (message.content === "stop bot") {
    wedJob.stop();
    satJob.stop();
    client.send("stopped cron jobs");
  }
  if (message.content === "send now") {
    execute();
  }
  if (message.content === "restart bot") {
    wedJob.start();
    satJob.start();
    client.send("started cron jobs");
  }
});

client.on('ready', () => {
  console.log('ready to send');
  wedJob.start();
  satJob.start();
  console.log('cron job start');
});
client.login(process.env.TOKEN);