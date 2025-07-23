import { loadMembersFromSheet } from "./workers/member_fetcher"
import type { MembersAndRule } from "./workers/member_fetcher"
import { yieldNoticeMessage, yieldMemberListMessage, sendMessage } from "./workers/message_worker";
import { loadCommands } from "workers/commandLoadWorker";
import type { CommandInteraction } from "discord.js";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js'
import { CronJob } from 'cron'
import 'dotenv/config'

const client = new Client(
  { intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
    ]
  }
);
client.commands = new Collection<string, { interaction: (interaction: CommandInteraction) => Promise<void>; execute(interaction: CommandInteraction): () => void; }>();

// スラッシュコマンドを利用するための準備を行う
loadCommands(client)

// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
client.on(Events.InteractionCreate, async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`${interaction.commandName} は見つかりませんでした`)
    return;
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `There was an error while executing this command!: ${error}`, flags: MessageFlags.Ephemeral })
    } else {
      await interaction.reply({ content: `There was an error while executing this command!: ${error}`, flags: MessageFlags.Ephemeral })
    }
  }
})

const execute = () => {
  loadMembersFromSheet().then(async (membersAndRule: MembersAndRule) => {
    if (membersAndRule.members.length === 0) {
      return;
    }
    let message = await yieldNoticeMessage(membersAndRule);
    yieldMemberListMessage(membersAndRule.members).then(async (m: string) => {
      message = `${message}\n${m}`;
      // デプロイ先の本番環境でのみメッセージが送信される仕組み
      // TODO: 環境変数を boolean 型にする
      if (process.env.IS_PRODUCTION === 'true') {
        sendMessage(message, client);
        console.log('sent a message');
      }
      console.log('finished all process');
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

// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
client.on('messageCreate', (message: any) => {
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