interface PexelsVideo {
  id: number;
  url: string;
  width: number;
  height: number;
  duration: number;
  video_files: Array<{
    link: string;
    quality: string;
    width: number;
    height: number;
  }>;
}

export async function searchPexelsVideos(
  query: string,
  orientation: "portrait" | "landscape" = "portrait",
  perPage = 5
): Promise<PexelsVideo[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${perPage}`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) return [];

  const data = (await res.json()) as { videos: PexelsVideo[] };
  return data.videos ?? [];
}

export function getBestVideoFile(video: PexelsVideo): string | null {
  const sorted = [...video.video_files].sort(
    (a, b) => (b.width || 0) - (a.width || 0)
  );
  return sorted[0]?.link ?? null;
}
