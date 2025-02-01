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
  async execute(interaction, option) {
    await interaction.reply(option)
  } 
}