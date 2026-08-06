'use client';

import { useState, useEffect } from 'react';
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  const renderNavItems = (onItemClick?: () => void) => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn('sidebar-link', isActive && 'active')}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarContent = (mobile = false) => (
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
          {(!collapsed || mobile) && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-300 leading-tight truncate">
                تسميع القرآن
              </p>
              <p className="text-[10px] text-emerald-500/50 truncate">الكريم</p>
            </div>
          )}
          {/* Close button on mobile sidebar header */}
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="mr-auto p-1.5 rounded-lg text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {(!collapsed || mobile) && (
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
      {renderNavItems(mobile ? () => setMobileOpen(false) : undefined)}

      {/* Collapse Toggle (desktop only) */}
      {!mobile && (
        <div className="hidden md:block p-3 border-t border-emerald-500/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full justify-center"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span className="text-sm">طي القائمة</span>}
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-emerald-500/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm">تسجيل الخروج</span>}
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
        {renderSidebarContent(false)}
      </motion.aside>

      {/* Mobile Hamburger Button - integrated into header space */}
      <button
        id="mobile-menu-btn"
        className="md:hidden fixed top-3 right-3 z-[60] w-10 h-10 flex items-center justify-center rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="القائمة"
        style={{
          background: mobileOpen ? 'rgba(16,185,129,0.2)' : 'rgba(6,95,70,0.3)',
          border: '1px solid rgba(16,185,129,0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <AnimatePresence mode="wait">
          {mobileOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-emerald-400" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-5 h-5 text-emerald-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/70 z-[55] backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              className="md:hidden fixed top-0 right-0 h-full w-72 z-[60] flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{
                background: 'rgba(5, 15, 7, 0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
