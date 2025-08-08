import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url';
import type { Client } from 'discord.js'
import { MessageFlags } from 'discord.js'

/**
 * loadCommands
 * スラッシュコマンドを読み込み利用可能な状態にする
 *
 * @param client Client
 */
export const loadCommands = (client: Client) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const foldersPath = path.join(__dirname, '/../commands')
  const commandFolders = fs.readdirSync(foldersPath)

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'))

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      (async () => {
        const command = await import(filePath)
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command)
        } else {
          console.log('data もしくは execute がありません')
        }
      })()
    }
  }
}

/**
 * setupCommands
 * コマンドを実行可能な状態にする
 *
 * @param client Client
 */
// biome-ignore lint/suspicious/noExplicitAny: 代替する型が見つからないため
export const setupCommands = async (interaction: any, client: Client) => {
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
}