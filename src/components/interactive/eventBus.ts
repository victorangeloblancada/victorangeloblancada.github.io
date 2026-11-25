export interface LabStatePayload {
  sourceId: string;
  metric: string;
  value: number | string;
}

export function emitLabEvent<T = unknown>(eventName: string, detail: T): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<T>(`lab:${eventName}`, { detail }));
}

export function onLabEvent<T = unknown>(
  eventName: string,
  handler: (detail: T) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<T>).detail);
  };
  window.addEventListener(`lab:${eventName}`, listener);
  return () => window.removeEventListener(`lab:${eventName}`, listener);
}
