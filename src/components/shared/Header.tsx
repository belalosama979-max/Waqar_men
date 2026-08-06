'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

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
      className="sticky top-0 z-30 flex items-center justify-between"
      style={{
        background: 'rgba(8, 13, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16,185,129,0.1)',
        // Safe area padding
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: '0.75rem',
        paddingRight: '1rem',
        paddingLeft: '1rem',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left side: title — offset on mobile to not overlap hamburger */}
      <div className="flex items-center gap-3 mr-12 md:mr-0">
        <div>
          <h1 className="text-base md:text-lg font-bold text-emerald-100 leading-tight">{title}</h1>
          <p className="text-[11px] text-emerald-500/50 hidden md:block">
            {greeting}، {user?.name}
          </p>
        </div>
      </div>

      {/* Right side: greeting on mobile + Date on desktop */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile greeting */}
        <p className="text-xs text-emerald-400/60 md:hidden">
          {greeting}، <span className="text-emerald-300/80 font-medium">{user?.name?.split(' ')[0]}</span>
        </p>

        {/* Desktop date */}
        <div className="hidden sm:block text-left">
          <p className="text-xs text-emerald-300/60 font-medium">
            {now.toLocaleDateString('ar-SA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
