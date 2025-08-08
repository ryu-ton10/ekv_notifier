import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from 'discord.js'
import { fetchShift } from './../../workers/shiftFetcher';

export const data = new SlashCommandBuilder()
  .setName('shift')
  .setDescription('参加予定日をお知らせします')
  .addStringOption(option =>
    option.setName('year')
      .setDescription('年'))
  .addStringOption(option =>
    option.setName('month')
      .setDescription('月'));

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const year = await interaction.options.getString('year')
  let month = await interaction.options.getString('month')
  // NOTE: 04 などの文字が入力された場合は先頭の 0 を削除する
  if (month?.startsWith('0')) {
    month = month.slice(1)
  }

  const message = fetchShift(year, month, interaction.user.id)
  await interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}\n※突発的な変動や調整がありますので、必ず <#1131285823757758475> をご確認ください！`)
}