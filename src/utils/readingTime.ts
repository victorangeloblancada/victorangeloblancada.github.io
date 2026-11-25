/**
 * Calculate estimated reading time in minutes (matching legacy 180 WPM baseline).
 */
export function estimateReadingTime(rawText: string | undefined): {
  words: number;
  minutes: number;
  label: string;
} {
  if (!rawText) {
    return { words: 0, minutes: 1, label: '1 min read' };
  }
  const plain = rawText
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = plain ? plain.split(' ').length : 0;
  const minutes = Math.max(1, Math.round(words / 180));
  return {
    words,
    minutes,
    label: `${minutes} min read`,
  };
}
