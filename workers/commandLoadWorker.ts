import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url';
import type { Client } from 'discord.js'

/**
 * loadCommands
 * スラッシュコマンドを読み込み利用可能な状態にする
 *
 * @param client Client
 */
export function loadCommands(client: Client) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const foldersPath = path.join(__dirname, 'commands')
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