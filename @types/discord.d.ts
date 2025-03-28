import { Client } from "discord.js";
import type { Collection, Message } from "discord.js";

declare module "discord.js" {
	interface Client {
		commands: Collection<
			string,
			{
        interaction: (interaction: CommandInteraction) => Promise<void>,
        execute(interaction: CommandInteraction): () => void,
      }
		>;
    message: Collection<Message>,
    send(string: string): () => void
	}
}