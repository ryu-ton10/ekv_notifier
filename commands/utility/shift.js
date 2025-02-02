const { SlashCommandBuilder } = require('discord.js')
const { getRows, loadShiftFromSheet } = require('./../../shift_fetcher')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('参加予定日をお知らせします')
    .addStringOption(option =>
      option.setName('year')
        .setDescription('年'))
    .addStringOption(option =>
      option.setName('month')
        .setDescription('月'))
    .setDefaultMemberPermissions(process.env.GUILD_ID),
  async execute(interaction) {
    const year = await interaction.options.getString('year')
    const month = await interaction.options.getString('month')
    await getRows().then(rows => {
      message = loadShiftFromSheet(rows, interaction.user.id, year, month)
      interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}\n※突発的な変動や調整がありますので、必ず <#1131285823757758475> をご確認ください！`)
    })
  } 
}