'use client';

import * as React from 'react';

import { type UseChatHelpers, useChat as useBaseChat } from '@ai-sdk/react';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type UIMessage, DefaultChatTransport } from 'ai';
import { useEditorRef, usePluginOption } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-kit';

import { findDocumentTextRange, insertAuroraComment } from './aurora-comments';

export type ToolName = 'comment' | 'edit' | 'generate';

export type TComment = {
  comment: {
    blockId: string;
    comment: string;
    content: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type MessageDataPart = {
  toolName: ToolName;
  comment?: TComment;
};

export type Chat = UseChatHelpers<ChatMessage>;

export type ChatMessage = UIMessage<{}, MessageDataPart>;

export const useChat = () => {
  const editor = useEditorRef();
  const options = usePluginOption(aiChatPlugin, 'chatOptions');

  const baseChat = useBaseChat<ChatMessage>({
    id: 'editor',
    transport: new DefaultChatTransport({
      api: options.api || '/api/ai/command',
      fetch: (async (input, init) => {
        const bodyOptions = editor.getOptions(aiChatPlugin).chatOptions?.body;

        const initBody = JSON.parse(init?.body as string);

        const body = {
          ...initBody,
          ...bodyOptions,
        };

        const res = await fetch(input, {
          ...init,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('[AI Chat] API Error:', res.status, errorText);
          throw new Error(`AI request failed (${res.status}): ${errorText}`);
        }

        return res;
      }) as typeof fetch,
    }),
    onData(data) {
      if (data.type === 'data-toolName') {
        editor.setOption(AIChatPlugin, 'toolName', data.data);
      }

      if (data.type === 'data-comment' && data.data) {
        if (data.data.status === 'finished') {
          editor.getApi(BlockSelectionPlugin).blockSelection.deselect();

          return;
        }

        const aiComment = data.data.comment!;
        const range = aiCommentToRange(editor, aiComment) ?? findDocumentTextRange(editor, aiComment.content);
        if (!range) return console.warn('No exact passage found for AI comment');
        insertAuroraComment(editor, {
          excerpt: aiComment.content,
          comment: aiComment.comment,
          range,
          transient: true,
        });
      }
    },

    ...options,
  });

  React.useEffect(() => {
    editor.setOption(AIChatPlugin, 'chat', baseChat as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseChat.status, baseChat.messages, baseChat.error]);

  return baseChat;
};
