"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { KeyRound, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AiProvider = 'gemini' | 'groq';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentApiKey: string | null;
  currentProvider: AiProvider;
  onSave: (newKey: string, provider: AiProvider) => void;
  /** Called when user intentionally clears/removes their API key */
  onClear?: () => void;
}

export function ApiKeyDialog({ isOpen, onOpenChange, currentApiKey, currentProvider, onSave, onClear }: ApiKeyDialogProps) {
  const [key, setKey] = useState('');
  const [provider, setProvider] = useState<AiProvider>(currentProvider);

  useEffect(() => {
    // Sync local state when dialog opens
    if (isOpen) {
      setKey(currentApiKey ?? '');
      setProvider(currentProvider);
    }
  }, [currentApiKey, currentProvider, isOpen]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) {
      onSave(trimmed, provider);
    }
  };

  const handleClear = () => {
    setKey('');
    onClear?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5"/>
            AI Provider Settings
          </DialogTitle>
          <DialogDescription>
            Choose your AI provider and enter your API key. The key is stored only in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={(v) => { setProvider(v as AiProvider); setKey(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini (Free)</SelectItem>
                <SelectItem value="groq">Groq Llama (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">
              {provider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
            </Label>
            <Input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && key.trim() && handleSave()}
              placeholder={provider === 'gemini' ? 'Enter your Gemini API key' : 'Enter your Groq API key'}
            />
            <p className="text-xs text-muted-foreground pt-1">
              {provider === 'gemini' ? (
                <>
                  Get a free key from{' '}
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary underline">
                    Google AI Studio
                  </Link>.
                </>
              ) : (
                <>
                  Get a free key from{' '}
                  <Link href="https://console.groq.com/keys" target="_blank" className="text-primary underline">
                    Groq Console
                  </Link>.
                  {' '}Uses Llama 3.3 70B model.
                </>
              )}
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentApiKey && (
            <Button variant="ghost" className="text-destructive hover:text-destructive sm:mr-auto" onClick={handleClear}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Key
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!key.trim()}>Save Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
