import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { fetchMember } from "./../../workers/memberFetcher.ts";
import 'dotenv/config'

export const data = new SlashCommandBuilder()
  .setName('find')
  .setDescription('ユーザの URL を取得します')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('メンバーを選択してください')
      .setRequired(true)
  )
  .setContexts(InteractionContextType.Guild);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.options.getUser('target');
  if (!member) {
    await interaction.reply('メンバーが見つかりませんでした。');
    return;
  }
  const message = await fetchMember(member.id);
  await interaction.reply(`${message}`);
}