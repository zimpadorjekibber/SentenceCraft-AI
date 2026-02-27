// src/types/ai-types.ts

// This file defines shared types for AI-related data structures.

/**
 * Represents a single word or punctuation mark along with its Part-of-Speech tag.
 */
export interface WordPos {
  word: string; // The actual textual word or punctuation
  pos: string;  // The Part-of-Speech tag (e.g., "Noun", "Verb", "Punctuation")
}
