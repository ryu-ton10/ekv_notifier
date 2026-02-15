import { fetchGameMaster, fetchMember } from "./memberFetcher.ts"
import 'dotenv/config'

export type VideoUrl = {
  name: string
  url: string
}

/**
 * fetchStreams
 * 参加メンバーの配信枠を YouTube Data API を利用して取得する
 *
 * @param members string[] 参加メンバーの ID 一覧
 * @return VideoUrl[] 配信枠一覧
 */
export const fetchStreams = async (members: string[]): Promise<VideoUrl[]> => {
  const result: VideoUrl[] = []

  // 決め打ちで GM の配信枠を取得する
  const gm = await fetchGameMaster();
  result.push(await callApi(gm.name, gm.channelId, 'upcoming'))

  // 当日参加するメンバーの配信枠を取得する
  for (const m of members) {
    const member = await fetchMember(m);

    if (member.channelId === '') {
      continue;
    }

    const videoUrl = await callApi(member.name, member.channelId, 'upcoming')
    result.push(videoUrl)
  }

  return result
}

/**
 * callApi
 * YouTube Data API を呼び出して配信枠を取得する
 *
 * @param name string メンバー名
 * @param channelId string チャンネル ID
 * @param eventType string イベントタイプ（upcoming など）
 * @return VideoUrl 配信枠情報
 */
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
    console.log("Error fetching stream:", error)
    return { name: '', url: '' }
  }
}