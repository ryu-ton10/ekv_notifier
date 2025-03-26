import { Client } from "discord.js";
import type { Collection, Message } from "discord.js";
export { Collection, CommandInteraction, Message } from "discord.js"

declare module "discord.js" {
	interface Client {
		commands: Collection<
			string,
			(interaction: CommandInteraction) => Promise<void>
		>;
    message: Collection<Message>
	}
}