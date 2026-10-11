/** Build-time destinations only; no message content enters a URL. */
export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';
export const HOME_URL = import.meta.env.BASE_URL;
export const BEHIND_URL = `${HOME_URL}?view=how-it-works`;

export function analysisUrl(base = import.meta.env.VITE_API_BASE_URL ?? ''): string {
  if (!base) return '/api/analyze';
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('invalid_api_destination');
  }
  return `${url.origin}/api/analyze`;
}
