'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNativeLanguage } from '@/context/language-context';
import { LANGUAGE_OPTIONS } from '@/lib/native-labels';

export function LanguageSelector() {
  const { nativeLanguage, setNativeLanguage } = useNativeLanguage();

  const current = LANGUAGE_OPTIONS.find(l => l.code === nativeLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={`Language: ${current?.name}`}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch native language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setNativeLanguage(lang.code)}
            className={`py-2.5 ${nativeLanguage === lang.code ? 'bg-primary/10 font-semibold' : ''}`}
          >
            <span className="mr-2 text-base">{lang.nativeName}</span>
            <span className="text-muted-foreground text-sm">({lang.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
