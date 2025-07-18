import { loadShiftFromSheet } from './../../workers/shift_fetcher'
import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from "discord.js";
import { fetchRowsFromSheet } from './../../workers/spreadsheet_worker';

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
  let year = await interaction.options.getString('year')
  let month = await interaction.options.getString('month')
  // NOTE: 04 などの文字が入力された場合は先頭の 0 を削除する
  if (month?.startsWith('0')) {
    month = month.slice(1)
  }

  const memberListSheetId = process.env.MEMBER_LIST_WORKSHEET_ID ?? ''
  let message = ''
  await fetchRowsFromSheet(Number(memberListSheetId)).then(rows => {
    if (!year || !month) {
      // 年月を入力しなかった場合は、現在日時のシフトを返却する
      const currentDate = new Date(Date.now());
      year = String(currentDate.getFullYear());
      // NOTE: Date から生成される月は 0 からのスタートであるため +1 している
      month = String(Number(currentDate.getMonth()) + 1);
    }
    message = loadShiftFromSheet(rows, interaction.user.id, year, month)
  })
  await interaction.reply(`${interaction.user} さんの ${year}年${month}月の参加予定日は以下です。\n${message}\n※突発的な変動や調整がありますので、必ず <#1131285823757758475> をご確認ください！`)
}