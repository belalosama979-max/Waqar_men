'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { seedDatabase } from '@/lib/db';
import { InstallBanner } from './InstallBanner';
import { NativeShell } from './NativeShell';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Initialize DB with seed data on first load
    seedDatabase.init().catch(console.error);
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        dir="rtl"
        offset="calc(var(--safe-area-inset-top, env(safe-area-inset-top)) + 12px)"
        mobileOffset={{ top: 'calc(var(--safe-area-inset-top, env(safe-area-inset-top)) + 12px)' }}
        toastOptions={{
          style: {
            background: 'linear-gradient(180deg, #13211a, #0d1712)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px -12px rgba(0,0,0,0.7)',
            color: '#ecfdf5',
            fontFamily: 'var(--font-cairo), Cairo, sans-serif',
            fontWeight: 600,
            direction: 'rtl',
          },
        }}
      />
      {/* the app is already installed: no "install" prompt, but wire up native behaviour */}
      {isNative ? <NativeShell /> : <InstallBanner />}
    </>
  );
}
