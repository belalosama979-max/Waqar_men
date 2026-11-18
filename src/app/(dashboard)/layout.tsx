'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Sidebar, BottomTabs } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  // The first render matches the prerendered HTML, where nobody is logged in yet.
  // Deciding before the saved session is visible bounced every reload / deep link to /login.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Role-based route guard
    if (user?.role === 'teacher' && pathname.startsWith('/admin')) {
      router.replace('/teacher');
    } else if (user?.role === 'admin' && pathname.startsWith('/teacher')) {
      router.replace('/admin');
    }
  }, [hydrated, isAuthenticated, user, pathname, router]);

  // each screen opens at its top, like a native app
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'contain' }}>
          {/* enter-only transition: no exit wait, so taps feel instant */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 pt-4 md:p-6 min-h-full pb-tabbar md:pb-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}
