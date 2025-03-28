import { SlashCommandBuilder } from 'discord.js'
import { getRows, loadShiftFromSheet } from './../../workers/shift_fetcher'
import type { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName('shift')
  .setDescription('参加予定日をお知らせします')
  .addStringOption(option =>
    option.setName('year')
      .setDescription('年'))
  .addStringOption(option =>
    option.setName('month')
      .setDescription('月'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const year = await interaction.options.getString('year')
  const month = await interaction.options.getString('month')
  let message = ''
  await getRows().then(rows => {
    if (!year || !month) {
      interaction.reply(`${interaction.user}\n年月を指定した上で、再度コマンドを実行してください。`)
      return
    }
    message = loadShiftFromSheet(rows, interaction.user.id, year, month)
  })
  await interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}\n※突発的な変動や調整がありますので、必ず <#1131285823757758475> をご確認ください！`)
}