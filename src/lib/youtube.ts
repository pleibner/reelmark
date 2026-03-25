import { config } from '../config.js'

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/videos'

export interface VideoMetadata {
  title: string
  thumbnailUrl: string
  channelName: string
  durationSecs: number
  publishedAt: Date
  fetchedAt: Date
}

export function extractYoutubeId(url: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  let candidateId: string | null = null;

  if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
    if (parsed.pathname === '/watch') {
      candidateId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/embed/')) {
      candidateId = parsed.pathname.split('/')[2] ?? null;
    }
  } else if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    candidateId = parsed.pathname.slice(1);
  }

  if (!candidateId || !YOUTUBE_ID_REGEX.test(candidateId)) {
    return null;
  }

  return candidateId;
}

export async function fetchVideoMetadata(
  youtubeId: string
): Promise<VideoMetadata | null> {
  const url = `${YOUTUBE_API_BASE}?id=${encodeURIComponent(youtubeId)}&part=snippet,contentDetails&key=${config.youtubeApiKey}`
  let response; 

  try {
    response = await fetch(url)
  } catch (err) {
    console.error(`Network error fetching metadata for ${youtubeId}:`, err)
    return null
  }
  
  if (!response.ok) {
    throw new Error(
      `YouTube API responded with ${response.status} for ${youtubeId}: ${await response.text()}`
    )
  }

  const data = (await response.json()) as {
    items?: Array<{
      snippet?: {
        title?: string
        thumbnails?: { high?: { url?: string }; default?: { url?: string } }
        channelTitle?: string
        publishedAt?: string
      }
      contentDetails?: { duration?: string }
    }>
  }

  if (!data.items || data.items.length === 0) {
    return null
  }

  const item = data.items[0]
  const snippet = item.snippet ?? {}
  const contentDetails = item.contentDetails ?? {}

  return {
    title: snippet.title ?? '',
    thumbnailUrl:
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.default?.url ??
      '',
    channelName: snippet.channelTitle ?? '',
    durationSecs: parseIsoDuration(contentDetails.duration ?? ''),
    publishedAt: new Date(snippet.publishedAt ?? 0),
    fetchedAt: new Date(),
  }
}

/**
 * Convert ISO 8601 duration (e.g. "PT1H2M30S", "PT5M", "PT45S") to seconds.
 */
function parseIsoDuration(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso)
  if (!match) return 0
  const hours = Number.parseInt(match[1] ?? '0', 10)
  const minutes = Number.parseInt(match[2] ?? '0', 10)
  const seconds = Number.parseInt(match[3] ?? '0', 10)
  return hours * 3600 + minutes * 60 + seconds
}
