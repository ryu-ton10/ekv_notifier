import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config'

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
    const command = await import(filePath)
    if (command.data && command.execute) {
				commands.push(command.data.toJSON());
    } else {
      console.log('data もしくは execute がありません')
    }
	}
}

// Construct and prepare an instance of the REST module
const token = process.env.TOKEN ?? ''
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const clientId = process.env.CLIENT_ID ?? ''
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const data: any = await rest.put(
			Routes.applicationGuildCommands(clientId, process.env.GUILD_ID ?? ''),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();