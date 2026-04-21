/**
 * Memory Service
 * Handles persistence and semantic search using cosine similarity.
 */

export interface MemoryEntry {
  text: string;
  embedding: number[];
  timestamp: number;
}

const STORAGE_KEY = 'neuro_live_memory';

export const memoryService = {
  /**
   * Save a new memory entry to LocalStorage
   */
  save(text: string, embedding: number[]): void {
    const memories = this.getAll();
    const newEntry: MemoryEntry = {
      text,
      embedding,
      timestamp: Date.now()
    };
    memories.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  },

  /**
   * Retrieve all memories from LocalStorage
   */
  getAll(): MemoryEntry[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse memories', e);
      return [];
    }
  },

  /**
   * Find top K similar memories using cosine similarity
   */
  findSimilar(queryEmbedding: number[], topK: number = 5): MemoryEntry[] {
    const memories = this.getAll();
    if (memories.length === 0) return [];

    const scored = memories.map(entry => ({
      ...entry,
      score: this.cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    // Sort by score descending and take top K
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  },

  /**
   * Calculate Cosine Similarity between two vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
};
