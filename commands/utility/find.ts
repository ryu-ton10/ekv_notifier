import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from 'discord.js'
import 'dotenv/config'

export const data = new SlashCommandBuilder()
  .setName('find')
  .setDescription('ユーザの URL を取得します')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('メンバーを選択してください')
      .setRequired(true)
  )

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.options.getString('target');
  console.log(member);
}