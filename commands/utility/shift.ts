import { SlashCommandBuilder } from 'discord.js'
import { getRows, loadShiftFromSheet } from './../../workers/shift_fetcher'
import type { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('参加予定日をお知らせします')
    .addStringOption(option =>
      option.setName('year')
        .setDescription('年'))
    .addStringOption(option =>
      option.setName('month')
        .setDescription('月')),
  async execute(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
    const year = await options.getString('year')
    const month = await options.getString('month')
    await getRows().then(rows => {
      if (!year || !month) {
        interaction.reply(`${interaction.user}\n年月を指定した上で、再度コマンドを実行してください。`)
        return
      }
      const message = loadShiftFromSheet(rows, interaction.user.id, year, month)
      interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}\n※突発的な変動や調整がありますので、必ず <#1131285823757758475> をご確認ください！`)
    })
  } 
}