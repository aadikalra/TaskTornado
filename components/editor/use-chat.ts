'use client';

import * as React from 'react';

import { type UseChatHelpers, useChat as useBaseChat } from '@ai-sdk/react';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type UIMessage, DefaultChatTransport } from 'ai';
import { type TNode, KEYS, nanoid, NodeApi, TextApi } from 'platejs';
import { useEditorRef, usePluginOption } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-kit';

import { discussionPlugin } from './plugins/discussion-kit';

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
        const range = aiCommentToRange(editor, aiComment);

        if (!range) return console.warn('No range found for AI comment');

        const discussions =
          editor.getOption(discussionPlugin, 'discussions') || [];

        // Generate a new discussion ID
        const discussionId = nanoid();

        // Create a new comment
        const newComment = {
          id: nanoid(),
          contentRich: [{ children: [{ text: aiComment.comment }], type: 'p' }],
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: editor.getOption(discussionPlugin, 'currentUserId'),
        };

        // Create a new discussion
        const newDiscussion = {
          id: discussionId,
          comments: [newComment],
          createdAt: new Date(),
          documentContent: deserializeMd(editor, aiComment.content)
            .map((node: TNode) => NodeApi.string(node))
            .join('\n'),
          isResolved: false,
          userId: editor.getOption(discussionPlugin, 'currentUserId'),
        };

        // Update discussions
        const updatedDiscussions = [...discussions, newDiscussion];
        editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);

        // Apply comment marks to the editor
        editor.tf.withMerging(() => {
          editor.tf.setNodes(
            {
              [getCommentKey(newDiscussion.id)]: true,
              [getTransientCommentKey()]: true,
              [KEYS.comment]: true,
            },
            {
              at: range,
              match: TextApi.isText,
              split: true,
            }
          );
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
