const { SlashCommandBuilder } = require('discord.js')

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
    await interaction.reply(`${year} ${month} の参加予定日は以下です。`)
  } 
}