'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { BrandMark } from './BrandMark';
import { useLogout } from './useLogout';

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
  const path = pathname.replace(/\/$/, '');
  if (pageTitles[path]) return pageTitles[path];
  if (path.includes('/students/')) return 'ملف الطالب';
  return 'وقار';
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();
  const path = pathname.replace(/\/$/, '');
  const title = getPageTitle(path);
  const isRoot = path === '/admin' || path === '/teacher';
  const isSubPage = !pageTitles[path];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3"
      style={{
        background: 'linear-gradient(180deg, rgba(5,10,7,0.97) 0%, rgba(5,10,7,0.88) 100%)',
        borderBottom: '1px solid var(--line)',
        paddingTop: 'max(0.75rem, var(--safe-area-inset-top, env(safe-area-inset-top)))',
        paddingBottom: '0.75rem',
        paddingInline: '1rem',
      }}
    >
      {isSubPage ? (
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-300 active:scale-95 transition-transform"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--line-strong)' }}
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        <BrandMark size={40} className="md:hidden" />
      )}

      <div className="flex-1 min-w-0">
        {isRoot ? (
          <>
            <p className="text-[11px] text-emerald-400/55 leading-tight">{greeting}،</p>
            <h1 className="text-lg font-extrabold text-emerald-50 leading-tight truncate">{user?.name}</h1>
          </>
        ) : (
          <h1 className="text-lg font-extrabold text-emerald-50 leading-tight truncate">{title}</h1>
        )}
      </div>

      <p className="hidden sm:block text-xs text-emerald-300/55 font-medium">
        {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <button
        onClick={logout}
        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-red-300/70 active:scale-95 transition-transform"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
        aria-label="تسجيل الخروج"
      >
        <LogOut className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}
