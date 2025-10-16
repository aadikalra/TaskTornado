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
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const generateText = useCallback(async (prompt: string, model: string = 'gemma-3-12b-it') => {
    try {
      const data = await makeRequest('generate', { prompt, model });
      return data.response || '';
    } catch (err) {
      return ''; // Return empty string on error, error is already handled in makeRequest
    }
  }, [makeRequest]);

  const chat = useCallback(async (messages: AIMessage[], model = 'gemma-3-12b-it'): Promise<AIResponse> => {
    const defaultResponse: AIResponse = {
      response: 'I encountered an error. Please try again.',
      done: true,
      model,
      created_at: new Date().toISOString(),
    };

    try {
      const data = await makeRequest('chat', { 
        model, 
        messages,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });
      
      // Create a base response with all required fields
      const response: AIResponse = {
        response: '',
        done: data.done ?? true,
        model: data.model ?? model,
        created_at: data.created_at ?? new Date().toISOString(),
        message: data.message,
        raw: data // Include raw data for debugging
      };

      // Set the response content based on the available data
      if (data.message?.content) {
        response.response = data.message.content;
      } else if (typeof data.response === 'string') {
        response.response = data.response;
      } else {
        console.warn('Unexpected response format from AI service:', data);
        response.response = 'I received an unexpected response format. Please try again.';
      }
      
      return response;
    } catch (err) {
      console.error('Error in chat:', err);
      return {
        ...defaultResponse,
        response: 'Failed to get response from AI service. Please try again later.',
        raw: err instanceof Error ? err.message : String(err)
      };
    }
  }, [makeRequest]);

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
