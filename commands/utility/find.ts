import type { ChatInputCommandInteraction } from "discord.js";

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const members = await interaction.guild?.members.fetch();
  console.log(members);

  await interaction.reply('hoge')
}