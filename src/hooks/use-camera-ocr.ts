// src/hooks/use-camera-ocr.ts
"use client";

import { useRef, useState, useCallback } from 'react';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';

interface UseCameraOcrOptions {
  apiKey: string | null;
  aiProvider: AiProvider;
  onTextExtracted: (text: string) => void;
  onError: (message: string) => void;
  language?: 'english' | 'hindi';
}

/**
 * Compress/resize an image file to stay within server action payload limits.
 * Returns base64 string (without data URI prefix) and MIME type.
 */
function compressImage(
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.8
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Output as JPEG for smaller size
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function useCameraOcr({
  apiKey,
  aiProvider,
  onTextExtracted,
  onError,
  language = 'english',
}: UseCameraOcrOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerCamera = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input so the same file can be selected again
    event.target.value = '';

    if (!apiKey) {
      onError('API Key is missing. Please set your API key.');
      return;
    }

    setIsProcessing(true);

    try {
      const { base64, mimeType } = await compressImage(file, 1024, 0.8);

      const prompt = language === 'hindi'
        ? 'Extract ALL text from this image exactly as it appears. The text may be in Hindi (Devanagari script) or English or mixed. Return ONLY the extracted text, nothing else. No explanations, no formatting, no quotes — just the raw text.'
        : 'Extract ALL text from this image exactly as it appears. The text is likely in English. Return ONLY the extracted text, nothing else. No explanations, no formatting, no quotes — just the raw text.';

      const extractedText = await generateAIContentAction(apiKey, aiProvider, prompt, base64, mimeType);

      // Clean up any wrapping quotes or JSON formatting
      const cleanedText = extractedText
        .trim()
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/^```[\s\S]*?\n/, '')
        .replace(/\n```$/, '')
        .trim();

      if (cleanedText) {
        onTextExtracted(cleanedText);
      } else {
        onError('No text could be extracted from the image. Please try a clearer photo.');
      }
    } catch (err: any) {
      onError(err.message || 'Failed to extract text from image.');
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, aiProvider, onTextExtracted, onError, language]);

  return {
    fileInputRef,
    isProcessing,
    triggerCamera,
    handleFileSelected,
  };
}
