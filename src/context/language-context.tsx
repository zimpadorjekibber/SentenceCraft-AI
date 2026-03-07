'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type NativeLanguage = 'hi' | 'bo'; // Hindi or Tibetan (Bod)

interface LanguageContextType {
  nativeLanguage: NativeLanguage;
  setNativeLanguage: (lang: NativeLanguage) => void;
  /** Pick the right translation from a { hi, bo } record */
  t: (translations: Partial<Record<NativeLanguage, string>>) => string;
  /** Display name of current language */
  languageName: string;
  /** Script name for display */
  scriptLabel: string;
}

const LANGUAGE_META: Record<NativeLanguage, { name: string; scriptLabel: string }> = {
  hi: { name: 'हिन्दी', scriptLabel: 'Hindi' },
  bo: { name: 'བོད་སྐད', scriptLabel: 'Tibetan' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>('hi');

  useEffect(() => {
    const stored = localStorage.getItem('native_language') as NativeLanguage | null;
    if (stored && (stored === 'hi' || stored === 'bo')) {
      setNativeLanguage(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('native_language', nativeLanguage);
  }, [nativeLanguage]);

  const t = (translations: Partial<Record<NativeLanguage, string>>): string => {
    return translations[nativeLanguage] || translations['hi'] || '';
  };

  const meta = LANGUAGE_META[nativeLanguage];

  return (
    <LanguageContext.Provider value={{
      nativeLanguage,
      setNativeLanguage,
      t,
      languageName: meta.name,
      scriptLabel: meta.scriptLabel,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useNativeLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useNativeLanguage must be used within a LanguageProvider');
  }
  return context;
}
