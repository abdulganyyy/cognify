export interface TextChunk {
  content: string;
  charStart: number;
  charEnd: number;
}

export function chunkText(
  text: string,
  maxChars = 2500,
  overlapChars = 200
): TextChunk[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  if (cleaned.length <= maxChars) {
    return [{ content: cleaned, charStart: 0, charEnd: cleaned.length }];
  }

  const chunks: TextChunk[] = [];
  let cursor = 0;

  while (cursor < cleaned.length) {
    let end = Math.min(cursor + maxChars, cleaned.length);

    if (end < cleaned.length) {
      const paragraphBreak = cleaned.lastIndexOf("\n\n", end);
      const sentenceBreak = cleaned.lastIndexOf(". ", end);
      if (paragraphBreak > cursor + maxChars * 0.5) {
        end = paragraphBreak + 2;
      } else if (sentenceBreak > cursor + maxChars * 0.5) {
        end = sentenceBreak + 2;
      }
    }

    const slice = cleaned.slice(cursor, end).trim();
    if (slice) {
      chunks.push({
        content: slice,
        charStart: cursor,
        charEnd: end,
      });
    }

    if (end >= cleaned.length) break;
    cursor = Math.max(cursor + 1, end - overlapChars);
  }

  return chunks;
}
