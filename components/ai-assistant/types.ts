import { Class, Homework } from '@/context/ClassContext';

export interface AIChecklistData {
  title: string;
  items: string[];
}

export interface InteractiveButton {
  id: string;
  text: string;
  shortcut?: string;
  prompt: string;
  style?: 'primary' | 'secondary' | 'outline';
  action?: 'send_prompt' | 'copy';
  payload?: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  images?: string[];
  interactiveButtons?: InteractiveButton[];
  checklist?: AIChecklistData;
  bulkAddDisplay?: {
    homeworks: Homework[];
    classes: Class[];
  };
  chunks?: string[];
  toolCall?: string;
  toolArgs?: any;
  toolCalls?: Array<{ name: string; args?: any; status?: 'loading' | 'success' | 'error'; error?: string }>;
  thought?: string;
  groundingMetadata?: {
    searchEntryPoint?: {
      renderedContent?: string;
    };
    groundingChunks?: Array<{
      web?: {
        uri: string;
        title?: string;
      };
    }>;
    groundingSupports?: any[];
    webSearchQueries?: string[];
  };
}
