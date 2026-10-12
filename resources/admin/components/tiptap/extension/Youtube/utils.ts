const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?!channel\/)(?!@)(.+)?$/;

export function isValidYoutubeUrl(url: string) {
  return url.match(YOUTUBE_REGEX);
}

type GetEmbedYoutubeUrlOptions = {
  url: string;
  autoplay?: boolean;
  nocookie?: boolean;
  controls?: boolean;
};

// Helpers
function toURL(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    try {
      return new URL(`https://${input}`);
    } catch {
      return null;
    }
  }
}

function extractYoutubeVideoId(u: URL): string | null {
  const host = u.hostname
    .replace(/^www\./, "")
    .replace(/^m\./, "")
    .replace(/^music\./, "");
  const path = u.pathname;

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (path.startsWith("/watch")) {
      const v = u.searchParams.get("v");
      return v || null;
    }
    if (path.startsWith("/shorts/")) {
      const parts = path.split("/");
      return parts[2] || null;
    }
    if (path.startsWith("/embed/")) {
      const parts = path.split("/");
      return parts[2] || null;
    }
  }

  return null;
}

export function getEmbedYoutubeUrl({
  url,
  nocookie,
  autoplay,
  controls,
}: GetEmbedYoutubeUrlOptions) {
  if (!isValidYoutubeUrl(url)) {
    return null;
  }

  const parsed = toURL(url);
  if (!parsed) {
    return null;
  }

  const videoId = extractYoutubeVideoId(parsed);
  if (!videoId) {
    return null;
  }

  const base = new URL(
    (nocookie ? "https://www.youtube-nocookie.com" : "https://www.youtube.com") +
      `/embed/${videoId}`
  );

  const params = new URLSearchParams();
  if (typeof autoplay === "boolean") params.set("autoplay", autoplay ? "1" : "0");
  if (typeof controls === "boolean") params.set("controls", controls ? "1" : "0");

  const qs = params.toString();
  if (qs) base.search = qs;

  return base.toString();
}

export type BuildYoutubeIframeOptions = GetEmbedYoutubeUrlOptions & {
  allowFullscreen?: boolean;
  width?: number;
  height?: number;
};

export function buildYoutubeIframe({
  url,
  nocookie,
  autoplay,
  controls,
  allowFullscreen = true,
  width = 560,
  height = 315,
}: BuildYoutubeIframeOptions) {
  const src = getEmbedYoutubeUrl({ url, nocookie, autoplay, controls });
  if (!src) return null;

  const allowAttr = allowFullscreen ? " allowfullscreen" : "";
  return `<iframe src="${src}"${allowAttr} style="border:0;" width="${width}" height="${height}"></iframe>`;
}
