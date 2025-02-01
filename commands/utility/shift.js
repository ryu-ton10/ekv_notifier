const { SlashCommandBuilder } = require('discord.js')
const { loadShiftFromSheet } = require('./../../shift_fetcher')

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
  async execute(interaction) {
    const year = interaction.options.getString('year')
    const month = interaction.options.getString('month')
    const message = loadShiftFromSheet(interaction.user.id, year, month)
    await interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}`)
  } 
}