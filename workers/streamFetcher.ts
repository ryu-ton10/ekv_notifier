import { fetchGameMaster } from "./memberFetcher"
import { fetchRowsFromSheet } from "./spreadsheetWorker"
import 'dotenv/config'

export type VideoUrl = {
  name: string
  url: string
}

export const fetchStreams = async (members: string[]): Promise<VideoUrl[]> => {
  const result: VideoUrl[] = []
  const memberMasterSheetId = process.env.MEMBER_MASTER_WORKSHEET_ID ?? ''

  // 決め打ちで GM の配信枠を取得する
  const gm = await fetchGameMaster();
  result.push(await callApi(gm.name, gm.channelId, 'upcoming'))

  // 当日参加するメンバーの配信枠を取得する
  const memberRows = await fetchRowsFromSheet(Number(memberMasterSheetId));
  for (const r of memberRows) {
    for (const m of members) {
      if (r.get('discordId') === m) {
        result.push(await callApi(r.get('name'), r.get('channelId'), 'upcoming'))
      }
    }
  }

  return result
}

export const callApi = async (name: string, channelId: string, eventType: string): Promise<VideoUrl> => {
  const url = `https://content-youtube.googleapis.com/youtube/v3/search?q=EKV&channelId=${channelId}&maxResults=1&part=snippet&type=video&eventType=${eventType}&key=${process.env.YOUTUBE_API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Response Status: ${response.status}`)
    }
    
    const json = await response.json()
    const parsedJson = await JSON.parse(JSON.stringify(json))

    // まだ配信枠を立てていない場合は名前だけを返却する
    if (parsedJson.items.length === 0) { return { name: name, url: '配信枠なし' } }

    const videoId = await parsedJson.items[0].id.videoId
    return {
      name: name,
      url: `https://www.youtube.com/watch?v=${videoId}`
    }
  } catch(error) {
    console.log(error)
    return { name: '', url: '' }
  }
}