import { useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { memoryService, MemoryEntry } from '../utils/memoryService';

interface UseMemoryProps {
  apiKey: string;
}

export const useMemory = ({ apiKey }: UseMemoryProps) => {
  const genAI = useMemo(() => new GoogleGenAI({ apiKey }), [apiKey]);

  /**
   * Store a text snippet in the long-term memory
   */
  const store = useCallback(async (text: string) => {
    try {
      const result = await genAI.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [text],
        config: { outputDimensionality: 768 }
      });
      const embedding = result.embeddings[0].values;
      
      memoryService.save(text, embedding);
      console.log('Memory stored:', text);
      return { status: "success" };
    } catch (e) {
      console.error('Failed to store memory', e);
      return { status: "error", message: String(e) };
    }
  }, [genAI]);

  /**
   * Search for similar memories given a query
   */
  const search = useCallback(async (query: string) => {
    try {
      const result = await genAI.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [query],
        config: { outputDimensionality: 768 }
      });
      const embedding = result.embeddings[0].values;
      
      const results = memoryService.findSimilar(embedding);
      return { 
        status: "success", 
        memories: results.map(r => ({ text: r.text, date: new Date(r.timestamp).toLocaleDateString() }))
      };
    } catch (e) {
      console.error('Failed to search memory', e);
      return { status: "error", message: String(e) };
    }
  }, [genAI]);

  return { store, search };
};
