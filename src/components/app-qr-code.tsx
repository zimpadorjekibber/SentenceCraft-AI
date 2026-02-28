// src/components/app-qr-code.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppQrCode() {
  const [showQR, setShowQR] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  if (!appUrl) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowQR(!showQR)}
        title="Scan QR Code to open app"
        className="h-9 w-9"
      >
        <QrCode className="h-5 w-5 text-primary" />
      </Button>

      {showQR && (
        <div className="absolute top-10 left-0 z-50 bg-card border-2 border-primary/30 rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary">Scan to Open App</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowQR(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="bg-white p-2 rounded-md">
            <QRCodeSVG
              value={appUrl}
              size={140}
              level="M"
              includeMargin={false}
              fgColor="#1a56db"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-[140px] break-all leading-tight">
            {appUrl}
          </p>
          <p className="text-[10px] text-center text-muted-foreground mt-1">
            QR scan karein ya Share button dabayein
          </p>
        </div>
      )}
    </div>
  );
}
