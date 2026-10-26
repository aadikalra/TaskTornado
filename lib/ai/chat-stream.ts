/** Read complete SSE events even when network chunks split JSON or UTF-8 text. */
export async function* readChatEvents(response: Response): AsyncGenerator<Record<string, any>> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Aurora returned an empty response. Please try again.');
  const decoder = new TextDecoder();
  let buffer = '';

  const parse = (frame: string) => {
    const payload = frame.split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, ''))
      .join('\n');
    if (!payload) return null;
    if (payload === '[DONE]') return { done: true };
    try {
      const data = JSON.parse(payload);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
      return data as Record<string, any>;
    } catch {
      throw new Error('Aurora’s response was interrupted. Please retry your message.');
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const event = parse(frame);
        if (event) yield event;
      }
      if (done) break;
    }
    const event = parse(buffer);
    if (event) yield event;
  } finally {
    reader.releaseLock();
  }
}
