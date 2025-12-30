import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { startRecording, stopRecording, isRecording } from './../../workers/recordManager.ts';
import { getResults, clearResults } from './../../store/raceResult.ts';

export const data = new SlashCommandBuilder()
  .setName('record')
  .setDescription('画像から順位を記録します')
  .addStringOption(option =>
    option.setName('option')
      .setDescription('スタート/ストップ'))
  .setContexts(InteractionContextType.Guild);

export const execute = async (interaction: ChatInputCommandInteraction) => {

  const option = interaction.options.getString('option')
  const gid = interaction.guildId

  if (!gid) {
    await interaction.reply('このコマンドはサーバー内で実行してください。')
    return
  }

  if (option === 'start') {

    if (isRecording(gid)) {
      await interaction.reply('既に記録モードです。')
      return
    }

    startRecording(gid)

    await interaction.reply('順位の記録を開始します。画像を投稿してください。\n終了するには、/record stop と入力してください。')

  } else if (option === 'stop') {

    const results = getResults(gid);
    if (!results || results.length === 0) {
      stopRecording(gid);
      await interaction.reply('記録された結果がありませんでした。');
      return;
    }

    // clear stored results for this guild
    clearResults(gid);
    stopRecording(gid);

    await interaction.reply(`記録を終了しました。\n最終結果:\n${results.map(r => `${r.name} [jp] ${r.score}`).join('\n')}`);
  }
}