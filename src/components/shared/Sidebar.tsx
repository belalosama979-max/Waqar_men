'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Trophy,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'لوحة القيادة', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/teachers', label: 'إدارة المعلمين', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/students', label: 'إدارة الطلاب', icon: <GraduationCap className="w-5 h-5" /> },
  { href: '/admin/leaderboard', label: 'لوحة الشرف', icon: <Trophy className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
];

const teacherNavItems: NavItem[] = [
  { href: '/teacher', label: 'لوحة القيادة', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/teacher/students', label: 'طلابي', icon: <GraduationCap className="w-5 h-5" /> },
  { href: '/teacher/leaderboard', label: 'لوحة الشرف', icon: <Trophy className="w-5 h-5" /> },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : teacherNavItems;

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.4), rgba(4,120,87,0.3))',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 15px rgba(16,185,129,0.15)',
            }}
          >
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-300 leading-tight truncate">
                تسميع القرآن
              </p>
              <p className="text-[10px] text-emerald-500/50 truncate">الكريم</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-emerald-500/10">
          <div className="glass-card-gold p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,119,6,0.3), rgba(180,83,9,0.2))',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}>
                {user?.role === 'admin' ? '🛡️' : '👨‍🏫'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-emerald-100 truncate">{user?.name}</p>
                <p className="text-xs text-gold-400/70">
                  {user?.role === 'admin' ? 'مشرف' : 'معلم'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (desktop) */}
      <div className="hidden md:block p-3 border-t border-emerald-500/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="text-sm">طي القائمة</span>}
        </button>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-emerald-500/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col h-screen sticky top-0 overflow-hidden"
        animate={{ width: collapsed ? 70 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: 'rgba(5, 15, 7, 0.9)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(16,185,129,0.1)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          background: 'rgba(6,95,70,0.3)',
          border: '1px solid rgba(16,185,129,0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {mobileOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed top-0 right-0 h-full w-64 z-50 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                background: 'rgba(5, 15, 7, 0.98)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
