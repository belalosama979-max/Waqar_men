'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/admin': 'لوحة القيادة',
  '/admin/teachers': 'إدارة المعلمين',
  '/admin/students': 'إدارة الطلاب',
  '/admin/leaderboard': 'لوحة الشرف',
  '/admin/settings': 'الإعدادات',
  '/teacher': 'لوحة القيادة',
  '/teacher/students': 'طلابي',
  '/teacher/leaderboard': 'لوحة الشرف',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Check student profile pattern
  if (pathname.startsWith('/teacher/students/')) return 'ملف الطالب';
  if (pathname.startsWith('/admin/students/')) return 'ملف الطالب';
  return 'نظام تسميع القرآن';
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const title = getPageTitle(pathname);
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <motion.header
      className="sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(8, 13, 8, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16,185,129,0.1)',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left side: title */}
      <div className="flex items-center gap-3 mr-12 md:mr-0">
        <div>
          <h1 className="text-lg font-bold text-emerald-100 leading-tight">{title}</h1>
          <p className="text-xs text-emerald-500/50 hidden md:block">
            {greeting}، {user?.name}
          </p>
        </div>
      </div>

      {/* Right side: Date + notification placeholder */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-left">
          <p className="text-xs text-emerald-300/60 font-medium">
            {now.toLocaleDateString('ar-SA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          style={{
            background: 'rgba(6,95,70,0.2)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <Bell className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </motion.header>
  );
}
