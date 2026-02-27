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

interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentApiKey: string | null;
  onSave: (newKey: string) => void;
  /** Called when user intentionally clears/removes their API key */
  onClear?: () => void;
}

export function ApiKeyDialog({ isOpen, onOpenChange, currentApiKey, onSave, onClear }: ApiKeyDialogProps) {
  const [key, setKey] = useState('');

  useEffect(() => {
    // Sync local state when dialog opens
    if (isOpen) {
      setKey(currentApiKey ?? '');
    }
  }, [currentApiKey, isOpen]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) {
      onSave(trimmed);
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
            Set Your Gemini API Key
          </DialogTitle>
          <DialogDescription>
            To use the AI features, please provide your own Google AI Studio API key. This key is stored only in your browser's local storage and is never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="api-key">Your Gemini API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && key.trim() && handleSave()}
            placeholder="Enter your API key here"
          />
          <p className="text-xs text-muted-foreground pt-2">
            Don't have a key? Get a free one from{' '}
            <Link href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary underline">
              Google AI Studio
            </Link>.
          </p>
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
