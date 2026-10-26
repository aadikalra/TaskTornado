import { Editor, Element, Node, Text, Transforms, type Path, type Range } from 'slate';
import { KEYS, nanoid } from 'platejs';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';

import { discussionPlugin, type TDiscussion } from './plugins/discussion-kit';

export function getDocumentText(editor: any): string {
  return editor.children.map((node: Node) => Node.string(node)).join('\n');
}

// Match whole passages across bold/italic/link leaves without guessing at the
// first few characters or attaching feedback to a different passage.
export function findDocumentTextRange(editor: any, excerpt: string): Range | null {
  if (!excerpt.trim()) return null;
  const leaves: Array<{ path: Path; start: number; end: number }> = [];
  let document = '';
  let previousBlock = '';
  for (const [leaf, path] of Node.texts(editor)) {
    const block = Editor.above(editor, {
      at: path,
      match: node => Element.isElement(node) && Editor.isBlock(editor, node),
    });
    const blockKey = (block?.[1] ?? path.slice(0, -1)).join('.');
    if (leaves.length && blockKey !== previousBlock) document += '\n';
    const start = document.length;
    document += leaf.text;
    leaves.push({ path, start, end: document.length });
    previousBlock = blockKey;
  }

  let start = document.indexOf(excerpt.trim());
  let end = start + excerpt.trim().length;
  if (start < 0) {
    const fold = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    let normalized = '';
    const offsets: number[] = [];
    for (let index = 0; index < document.length; index++) {
      const character = /\s/.test(document[index]) ? ' ' : fold(document[index]);
      if (character === ' ' && normalized.endsWith(' ')) continue;
      normalized += character;
      offsets.push(index);
    }
    const quote = fold(excerpt).replace(/\s+/g, ' ').trim();
    const position = normalized.indexOf(quote);
    if (position < 0) return null;
    start = offsets[position];
    end = offsets[position + quote.length - 1] + 1;
  }

  const first = leaves.find(leaf => leaf.start <= start && leaf.end > start);
  const last = [...leaves].reverse().find(leaf => leaf.start < end && leaf.end >= end);
  if (!first || !last) return null;
  return {
    anchor: { path: first.path, offset: start - first.start },
    focus: { path: last.path, offset: end - last.start },
  };
}

export function insertAuroraComment(editor: any, options: {
  excerpt: string;
  comment: string;
  suggestedReplacement?: string;
  range?: Range;
  transient?: boolean;
}): string | null {
  const range = options.range ?? findDocumentTextRange(editor, options.excerpt);
  if (!range || !options.comment.trim()) return null;
  const id = nanoid();
  const createdAt = new Date();
  const discussion: TDiscussion = {
    id, createdAt, documentContent: options.excerpt, isResolved: false, userId: 'aurora',
    comments: [{
      id: nanoid(), createdAt, discussionId: id, isEdited: false, userId: 'aurora',
      contentRich: [{ type: 'p', children: [{ text: options.comment }] }],
      suggestedReplacement: options.suggestedReplacement,
    }],
  };

  const rangeRef = Editor.rangeRef(editor, range);
  try {
    Editor.withoutNormalizing(editor, () => {
      // Remove only the legacy yellow AI highlight on this passage. The
      // editor's CommentLeaf supplies the normal comment tint and underline.
      Transforms.unsetNodes(editor, 'backgroundColor', {
        at: rangeRef.current!, split: true,
        match: node => Text.isText(node) && (node as any).backgroundColor === '#fef08a',
      });
      if (!rangeRef.current) return;
      Transforms.setNodes(editor, {
        [KEYS.comment]: true,
        [getCommentKey(id)]: true,
        ...(options.transient ? { [getTransientCommentKey()]: true } : {}),
      } as any, { at: rangeRef.current, match: Text.isText, split: true });
    });
  } finally {
    rangeRef.unref();
  }
  const discussions = editor.getOption(discussionPlugin, 'discussions') ?? [];
  editor.setOption(discussionPlugin, 'discussions', [...discussions, discussion]);
  return id;
}
