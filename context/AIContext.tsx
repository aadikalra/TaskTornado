'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

type AIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
};

export type AIResponse = {
  response: string;
  done: boolean;
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  // For debugging purposes
  raw?: any;
};

type AIContextType = {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  generateText: (prompt: string, model?: string) => Promise<string>;
  chat: (messages: AIMessage[], model?: string) => Promise<AIResponse>;
  clearError: () => void;
  isAIAssistantOpen: boolean;
  setAIAssistantOpen: (open: boolean) => void;
  isAISidebarMode: boolean;
  setAISidebarMode: (mode: boolean) => void;
  aiInput: string;
  setAIInput: (input: string) => void;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
  const [isAISidebarMode, setAISidebarMode] = useState(false);
  const [aiInput, setAIInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedInput = localStorage.getItem('ai-assistant-input');
      return savedInput || '';
    }
    return '';
  });

  // Sync aiInput with localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-assistant-input', aiInput);
    }
  }, [aiInput]);

  const makeRequest = useCallback(async (endpoint: string, body: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Always use the root /api/ai endpoint - the route.ts will handle the specific action
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          // Include the action in the request body
          action: endpoint
        }),
      });

      // First get the response as text
      const responseText = await response.text();

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Received invalid JSON response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to get response from AI service';
        const errorDetails = data?.details || 'No additional details available';
        console.error('AI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails,
          response: data
        });
        throw new Error(`${errorMessage}: ${errorDetails}`);
      }

      return data;
    } catch (err) {
      let errorMessage = 'An unknown error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Check for common error patterns
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the AI service. Please check your internet connection.';
      } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('invalid JSON')) {
        errorMessage = 'Received an invalid response from the AI service. The service might be unavailable.';
      }

      setError(errorMessage);
      console.error('AI request failed:', errorMessage, err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateText = useCallback(async (prompt: string, model: string = 'gemma-3n-e4b-it') => {
    try {
      const data = await makeRequest('generate', { prompt, model });
      return data.response || '';
    } catch (err) {
      return ''; // Return empty string on error, error is already handled in makeRequest
    }
  }, [makeRequest]);

  const chat = useCallback(async (messages: AIMessage[], model = 'gemma-3n-e4b-it'): Promise<AIResponse> => {
    const defaultResponse: AIResponse = {
      response: 'I encountered an error. Please try again.',
      done: true,
      model,
      created_at: new Date().toISOString(),
    };

    try {
      // For streaming responses, we need to handle the response differently
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          action: 'chat',
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error || 'Failed to get response from AI service';
        const errorDetails = errorData?.details || 'No additional details available';
        throw new Error(`${errorMessage}: ${errorDetails}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/plain')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = '';
        let finalModel = model;
        let createdAt = new Date().toISOString();

        if (!reader) {
          throw new Error('No response body reader available');
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.response) {
                    accumulatedResponse += data.response;
                  }
                  if (data.done) {
                    return {
                      response: accumulatedResponse,
                      done: true,
                      model: finalModel,
                      created_at: createdAt,
                    };
                  }
                } catch (parseError) {
                  console.error('Failed to parse streaming data:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // If we get here, the stream ended without a done message
        return {
          response: accumulatedResponse,
          done: true,
          model: finalModel,
          created_at: createdAt,
        };
      } else {
        // Handle non-streaming response (fallback)
        const responseData = await response.json();

        // Create a base response with all required fields
        const aiResponse: AIResponse = {
          response: '',
          done: responseData.done ?? true,
          model: responseData.model ?? model,
          created_at: responseData.created_at ?? new Date().toISOString(),
          message: responseData.message,
          raw: responseData // Include raw data for debugging
        };

        // Set the response content based on the available data
        if (responseData.message?.content) {
          aiResponse.response = responseData.message.content;
        } else if (typeof responseData.response === 'string') {
          aiResponse.response = responseData.response;
        } else {
          console.warn('Unexpected response format from AI service:', responseData);
          aiResponse.response = 'I received an unexpected response format. Please try again.';
        }

        return aiResponse;
      }
    } catch (err) {
      console.error('Error in chat:', err);
      return {
        ...defaultResponse,
        response: 'Failed to get response from AI service. Please try again later.',
        raw: err instanceof Error ? err.message : String(err)
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AIContext.Provider value={{
      isLoading,
      error,
      setError,
      generateText,
      chat,
      clearError,
      isAIAssistantOpen,
      setAIAssistantOpen,
      isAISidebarMode,
      setAISidebarMode,
      aiInput,
      setAIInput,
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
