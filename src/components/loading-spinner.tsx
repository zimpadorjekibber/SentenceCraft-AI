// src/components/loading-spinner.tsx
"use client";

import React from 'react';

interface LoadingSpinnerProps {
  /** When true, renders a small inline spinner. When false (default), renders centered full-height spinner. */
  inline?: boolean;
}

export function LoadingSpinner({ inline = false }: LoadingSpinnerProps) {
  if (inline) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        <span className="sr-only">Loading...</span>
      </span>
    );
  }
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
