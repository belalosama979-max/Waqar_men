'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';
import { useLogout } from './useLogout';

interface NavItem {
  href: string;
  label: string;
  short: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'لوحة القيادة', short: 'الرئيسية', Icon: LayoutDashboard },
  { href: '/admin/teachers', label: 'إدارة المعلمين', short: 'المعلمون', Icon: Users },
  { href: '/admin/students', label: 'إدارة الطلاب', short: 'الطلاب', Icon: GraduationCap },
  { href: '/admin/leaderboard', label: 'لوحة الشرف', short: 'الشرف', Icon: Trophy },
  { href: '/admin/settings', label: 'الإعدادات', short: 'الإعدادات', Icon: Settings },
];

const teacherNavItems: NavItem[] = [
  { href: '/teacher', label: 'لوحة القيادة', short: 'الرئيسية', Icon: LayoutDashboard },
  { href: '/teacher/students', label: 'طلابي', short: 'طلابي', Icon: GraduationCap },
  { href: '/teacher/leaderboard', label: 'لوحة الشرف', short: 'الشرف', Icon: Trophy },
];

function useNavItems() {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? adminNavItems : teacherNavItems;
}

/** A tab is active on its own page and on pages nested under it (e.g. a student profile). */
function isActive(pathname: string, href: string, items: NavItem[]) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === href) return true;
  if (!path.startsWith(href + '/')) return false;
  // the dashboard root must not light up when a more specific tab matches
  return !items.some((i) => i.href.length > href.length && path.startsWith(i.href));
}

/** Desktop / tablet sidebar. Phones use <BottomTabs/>. */
export function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = useNavItems();
  const logout = useLogout();

  return (
    <motion.aside
      className="hidden md:flex flex-col h-screen sticky top-0 overflow-hidden"
      animate={{ width: collapsed ? 76 : 252 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ background: 'rgba(6, 12, 8, 0.92)', borderLeft: '1px solid var(--line)' }}
    >
      <div className="p-4 border-b border-emerald-500/10 flex items-center gap-3">
        <BrandMark size={40} />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-base font-extrabold text-gradient-gold leading-tight">وقار</p>
            <p className="text-[11px] text-emerald-400/50 truncate">تسميع القرآن الكريم</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-emerald-500/10">
          <div className="glass-card-gold p-3 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gold-300"
              style={{ background: 'rgba(217,180,90,0.15)', border: '1px solid rgba(217,180,90,0.35)' }}
            >
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-emerald-50 truncate">{user?.name}</p>
              <p className="text-xs text-gold-400/80">{user?.role === 'admin' ? 'مشرف' : 'معلم'}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={cn('sidebar-link', isActive(pathname, href, navItems) && 'active')}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-emerald-500/10 space-y-1">
        <button onClick={() => setCollapsed(!collapsed)} className="sidebar-link w-full justify-center">
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="text-sm">طي القائمة</span>}
        </button>
        <button onClick={logout} className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </motion.aside>
  );
}

/** Phone bottom tab bar, app-style. */
export function BottomTabs() {
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <nav className="tabbar md:hidden fixed bottom-0 inset-x-0 z-40" aria-label="التنقل الرئيسي">
      <div className="flex items-stretch justify-around px-2" style={{ height: 'var(--nav-h)' }}>
        {navItems.map(({ href, short, Icon }) => {
          const active = isActive(pathname, href, navItems);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1"
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute top-[7px] h-8 w-14 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(4,120,87,0.14))',
                    border: '1px solid rgba(52,211,153,0.22)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon
                className={cn('relative w-[22px] h-[22px] transition-colors', active ? 'text-emerald-300' : 'text-emerald-200/45')}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span
                className={cn(
                  'relative text-[11px] leading-none transition-colors',
                  active ? 'text-emerald-100 font-bold' : 'text-emerald-200/45 font-medium'
                )}
              >
                {short}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
