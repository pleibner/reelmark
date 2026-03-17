const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

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
