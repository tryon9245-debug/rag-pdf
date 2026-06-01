const DEFAULT_CHUNK_SIZE = 1000;

function splitLongSegment(segment: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = segment.trim();

  while (remaining.length > maxLength) {
    const boundary = remaining.lastIndexOf(" ", maxLength);
    const cutAt = boundary > maxLength * 0.6 ? boundary : maxLength;
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

function splitParagraphIntoSentences(paragraph: string): string[] {
  const matches = paragraph.match(/[^.!?。！？]+[.!?。！？]*/g);
  return matches?.map((sentence) => sentence.trim()).filter(Boolean) ?? [
    paragraph,
  ];
}

function appendSegment(
  chunks: string[],
  current: string,
  segment: string,
  separator: string,
  maxLength: number,
): string {
  const candidate = current ? `${current}${separator}${segment}` : segment;
  if (candidate.length <= maxLength) {
    return candidate;
  }

  if (current) {
    chunks.push(current);
  }

  if (segment.length <= maxLength) {
    return segment;
  }

  const splitChunks = splitLongSegment(segment, maxLength);
  chunks.push(...splitChunks.slice(0, -1));
  return splitChunks.at(-1) ?? "";
}

export function chunkText(
  text: string,
  maxLength = DEFAULT_CHUNK_SIZE,
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let current = "";
  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLength) {
      current = appendSegment(chunks, current, paragraph, "\n\n", maxLength);
      continue;
    }

    for (const sentence of splitParagraphIntoSentences(paragraph)) {
      current = appendSegment(chunks, current, sentence, " ", maxLength);
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}
