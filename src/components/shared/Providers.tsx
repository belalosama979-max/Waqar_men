'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { seedDatabase } from '@/lib/db';
import { InstallBanner } from './InstallBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize DB with seed data on first load
    seedDatabase.init().catch(console.error);
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: {
            background: 'rgba(10, 20, 12, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#ecfdf5',
            fontFamily: 'var(--font-cairo), Cairo, sans-serif',
            direction: 'rtl',
          },
        }}
      />
      <InstallBanner />
    </>
  );
}
