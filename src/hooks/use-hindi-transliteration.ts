import { useState, useRef, useCallback } from 'react';

const GOOGLE_INPUT_TOOLS_URL =
  'https://inputtools.google.com/request?itc=hi-t-i0-und&num=5';

export interface TransliterationState {
  suggestions: string[];
  isLoading: boolean;
  /** The English word that was sent for transliteration */
  currentWord: string;
  /** Start index of the current word inside the full text */
  wordStart: number;
  /** End index of the current word inside the full text */
  wordEnd: number;
}

const INITIAL_STATE: TransliterationState = {
  suggestions: [],
  isLoading: false,
  currentWord: '',
  wordStart: 0,
  wordEnd: 0,
};

/**
 * Hook that provides Hindi transliteration suggestions using Google Input Tools.
 * As the user types in English/Roman characters, it fetches Hindi suggestions
 * for the current word.
 */
export function useHindiTransliteration() {
  const [state, setState] = useState<TransliterationState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSuggestions = useCallback(() => {
    setState(INITIAL_STATE);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  /**
   * Call this on every keystroke with the full text and cursor position.
   * It extracts the current English word at the cursor and fetches suggestions.
   */
  const fetchSuggestions = useCallback(
    (fullText: string, cursorPos: number) => {
      // Cancel any in-flight request
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();

      // Find the word boundaries around the cursor
      const textBeforeCursor = fullText.slice(0, cursorPos);
      const textAfterCursor = fullText.slice(cursorPos);

      const beforeMatch = textBeforeCursor.match(/[a-zA-Z]+$/);
      const afterMatch = textAfterCursor.match(/^[a-zA-Z]+/);

      if (!beforeMatch) {
        // No English word at cursor
        setState(INITIAL_STATE);
        return;
      }

      const wordStart = cursorPos - beforeMatch[0].length;
      const wordEnd = cursorPos + (afterMatch ? afterMatch[0].length : 0);
      const currentWord = fullText.slice(wordStart, wordEnd);

      if (currentWord.length < 1) {
        setState(INITIAL_STATE);
        return;
      }

      setState((prev) => ({
        ...prev,
        currentWord,
        wordStart,
        wordEnd,
        isLoading: true,
      }));

      // Debounce 200ms to avoid flooding the API
      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const res = await fetch(
            `${GOOGLE_INPUT_TOOLS_URL}&text=${encodeURIComponent(currentWord)}`,
            { signal: controller.signal }
          );
          const data = await res.json();

          // Google returns: ["SUCCESS", [["word", ["suggestion1","suggestion2",...], ...]]]
          if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) {
            setState((prev) => ({
              ...prev,
              suggestions: data[1][0][1] as string[],
              isLoading: false,
            }));
          } else {
            setState((prev) => ({ ...prev, suggestions: [], isLoading: false }));
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            setState((prev) => ({
              ...prev,
              suggestions: [],
              isLoading: false,
            }));
          }
        }
      }, 200);
    },
    []
  );

  /**
   * Apply a selected suggestion — replaces the English word in the full text.
   * Returns the new full text and new cursor position.
   */
  const applySuggestion = useCallback(
    (
      fullText: string,
      suggestion: string
    ): { newText: string; newCursorPos: number } => {
      const before = fullText.slice(0, state.wordStart);
      const after = fullText.slice(state.wordEnd);
      const newText = before + suggestion + ' ' + after;
      const newCursorPos = before.length + suggestion.length + 1;

      setState(INITIAL_STATE);
      return { newText, newCursorPos };
    },
    [state.wordStart, state.wordEnd]
  );

  return {
    ...state,
    fetchSuggestions,
    applySuggestion,
    clearSuggestions,
  };
}
