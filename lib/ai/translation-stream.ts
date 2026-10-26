export type TranslationSections = {
  translation: string;
  pronunciation: string;
  explanation: string;
};

export function parseTranslationSections(text: string): TranslationSections {
  const markers = /\[(\/?)(TRANSLATION|PRONUNCIATION|EXPLANATION)\]/gi;
  const parts: TranslationSections = { translation: '', pronunciation: '', explanation: '' };
  let section: keyof TranslationSections | null = null;
  let offset = 0;
  for (const match of text.matchAll(markers)) {
    if (section) parts[section] += text.slice(offset, match.index);
    section = match[1] ? null : match[2].toLowerCase() as keyof TranslationSections;
    offset = match.index! + match[0].length;
  }
  if (section) parts[section] += text.slice(offset);
  if (!/\[TRANSLATION\]/i.test(text)) {
    // A provider can return a plain translation instead of the requested tags.
    parts.translation = text.startsWith('[') ? '' : text;
  }
  for (const key of Object.keys(parts) as Array<keyof TranslationSections>) {
    // Do not flash a half-written tag while receiving the next network chunk.
    const bracket = parts[key].lastIndexOf('[');
    const suffix = parts[key].slice(bracket).toUpperCase();
    if (bracket >= 0 && ['[TRANSLATION]', '[PRONUNCIATION]', '[EXPLANATION]',
      '[/TRANSLATION]', '[/PRONUNCIATION]', '[/EXPLANATION]'].some(tag => tag.startsWith(suffix))) {
      parts[key] = parts[key].slice(0, bracket);
    }
    parts[key] = parts[key].trim();
  }
  return parts;
}

export async function readTranslationStream(
  stream: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = '';
  let completed = false;

  const consumeEvent = (event: string) => {
    const data = event.split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart()).join('\n');
    if (!data || data === '[DONE]') return;
    let payload;
    try { payload = JSON.parse(data); }
    catch { throw new Error('The translation response was interrupted. Please try again.'); }
    if (!payload || typeof payload !== 'object') throw new Error('The translation response was invalid. Please try again.');
    if (payload.error) throw new Error(typeof payload.error === 'string' ? payload.error : 'Translation failed.');
    if (typeof payload.translation === 'string' && payload.translation) {
      result += payload.translation;
      onText(result);
    }
    if (payload.done === true) completed = true;
  };

  const consumeBuffer = (flush = false) => {
    buffer = buffer.replace(/\r\n/g, '\n');
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      consumeEvent(event);
    }
    if (flush && buffer.trim()) { consumeEvent(buffer); buffer = ''; }
  };

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        consumeBuffer(true);
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      consumeBuffer();
    }
    if (!parseTranslationSections(result).translation) {
      throw new Error('No translation came back. Please try again.');
    }
    return result;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
