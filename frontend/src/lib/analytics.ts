export type GTMEventParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function sendGTMEvent(event: string, params: GTMEventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
