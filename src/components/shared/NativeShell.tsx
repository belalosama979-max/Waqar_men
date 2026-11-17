'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

const ROOTS = ['/', '/login', '/admin', '/teacher'];

/** Native-only glue for the Android app: status bar, splash, hardware back button. */
export function NativeShell() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // light icons over the dark app; the app draws edge-to-edge under the bars
    SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => {});
    // the first screen has painted: fade the native splash out
    SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {});
  }, []);

  useEffect(() => {
    const path = pathname.replace(/\/$/, '') || '/';
    const sub = App.addListener('backButton', () => {
      // close any open sheet / dialog first (they all close on Escape or backdrop)
      const backdrop = document.querySelector<HTMLElement>('.fixed.inset-0.z-50');
      if (backdrop) {
        backdrop.click();
        return;
      }
      if (ROOTS.includes(path)) App.minimizeApp();
      else router.back();
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, [pathname, router]);

  return null;
}
