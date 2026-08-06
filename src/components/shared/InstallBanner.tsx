'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

export function InstallBanner() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if already dismissed (within 7 days)
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(dismissedAt) < sevenDays) return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      // Show banner for iOS after short delay
      setTimeout(() => setShowBanner(true), 2000);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', String(Date.now()));
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || dismissed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[999] p-3 pb-safe"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div
            className="rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(5,30,10,0.98), rgba(8,20,12,0.98))',
              border: '1px solid rgba(16,185,129,0.35)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)',
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(5,150,105,0.4), rgba(4,120,87,0.3))',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-emerald-100 text-sm leading-tight">
                ثبّت التطبيق على هاتفك
              </p>
              {isIOS ? (
                <p className="text-xs text-emerald-400/60 mt-0.5 leading-tight">
                  اضغط 
                  <span className="mx-1 text-emerald-300">⎙</span>
                  ثم «إضافة للشاشة الرئيسية»
                </p>
              ) : (
                <p className="text-xs text-emerald-400/60 mt-0.5">
                  للعمل دون إنترنت وتجربة أفضل
                </p>
              )}
            </div>

            {/* Buttons */}
            {!isIOS && deferredPrompt && (
              <motion.button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#ecfdf5',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-3.5 h-3.5" />
                تثبيت
              </motion.button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg flex-shrink-0 text-emerald-500/50 hover:text-emerald-400 transition-colors"
              style={{ background: 'rgba(16,185,129,0.08)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
