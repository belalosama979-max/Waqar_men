'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, Eye, EyeOff, ChevronDown, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { teachersRepository, adminRepository } from '@/lib/db';
import { ADMIN_NAME } from '@/lib/constants';
import { BrandMark } from '@/components/shared/BrandMark';
import type { Teacher } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loginMode, setLoginMode] = useState<'admin' | 'teacher'>('teacher');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'admin' ? '/admin' : '/teacher');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    teachersRepository.getAll().then(setTeachers);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMode === 'admin') {
        const isValid = await adminRepository.verifyAdmin(adminUsername, password);
        if (isValid) {
          login({ id: 0, name: ADMIN_NAME, role: 'admin', username: adminUsername });
          toast.success('مرحباً بك يا مشرف! 🌟');
          router.replace('/admin');
        } else {
          toast.error('بيانات الدخول غير صحيحة');
        }
      } else {
        if (!selectedTeacherId) {
          toast.error('الرجاء اختيار اسم المعلم');
          return;
        }
        const teacher = teachers.find((t) => String(t.id) === selectedTeacherId);
        if (!teacher) {
          toast.error('المعلم غير موجود');
          return;
        }
        if (teacher.password === password) {
          login({
            id: teacher.id!,
            name: teacher.name,
            role: 'teacher',
            username: teacher.username,
          });
          toast.success(`مرحباً بك يا ${teacher.name}! 🌟`);
          router.replace('/teacher');
        } else {
          toast.error('كلمة المرور غير صحيحة');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { key: 'teacher' as const, label: 'معلم', Icon: GraduationCap },
    { key: 'admin' as const, label: 'مشرف', Icon: ShieldCheck },
  ];

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-end text-center px-6 pb-16"
        style={{
          minHeight: '42dvh',
          paddingTop: 'max(3rem, var(--safe-area-inset-top, env(safe-area-inset-top)))',
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(16,140,100,0.45) 0%, rgba(6,60,44,0.35) 45%, transparent 75%)',
        }}
      >
        {/* geometric pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden>
          <defs>
            <pattern id="stars" width="56" height="56" patternUnits="userSpaceOnUse">
              <rect x="14" y="14" width="28" height="28" fill="none" stroke="#a7f3d0" strokeWidth="1" />
              <rect x="14" y="14" width="28" height="28" fill="none" stroke="#a7f3d0" strokeWidth="1" transform="rotate(45 28 28)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <BrandMark size={84} />
        </motion.div>
        <motion.h1
          className="relative mt-5 text-4xl font-black text-gradient-gold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          وقار
        </motion.h1>
        <motion.p
          className="relative mt-1 text-emerald-100/70 text-sm font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          نظام إدارة تسميع القرآن الكريم
        </motion.p>
        <p className="relative mt-3 text-gold-300/70 text-base" style={{ fontFamily: 'var(--font-arabic)' }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative -mt-8 flex-1 w-full max-w-md mx-auto px-4"
        style={{ paddingBottom: 'max(1.5rem, var(--safe-area-inset-bottom, env(safe-area-inset-bottom)))' }}
      >
        <div className="glass-card p-5 sm:p-7">
          {/* Mode toggle */}
          <div className="relative grid grid-cols-2 p-1 rounded-2xl mb-6" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid var(--line)' }}>
            {modes.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setLoginMode(key);
                  setPassword('');
                  setSelectedTeacherId('');
                  setAdminUsername('');
                }}
                className="relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ color: loginMode === key ? '#ecfdf5' : 'rgba(167,243,208,0.5)' }}
              >
                {loginMode === key && (
                  <motion.span
                    layoutId="login-mode"
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{ background: 'linear-gradient(160deg, #10a877, #046c4e)', boxShadow: '0 6px 16px -6px rgba(16,185,129,0.6)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === 'admin' ? (
              <div>
                <label className="block text-emerald-200/75 text-sm font-semibold mb-1.5">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/55" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="input-glass pr-10"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-emerald-200/75 text-sm font-semibold mb-1.5">اختر اسم المعلم</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/55 pointer-events-none z-10" />
                  <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/55 pointer-events-none z-10" />
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="select-glass pr-10 pl-10"
                    required
                  >
                    <option value="">— اختر المعلم —</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-emerald-200/75 text-sm font-semibold mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/55" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="input-glass pr-10 pl-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-emerald-400/60"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginMode === 'teacher' && selectedTeacherId && (
                <p className="text-xs text-emerald-400/50 mt-1.5">كلمة المرور: الاسم الأول + 123</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-emerald w-full justify-center !min-h-[52px] text-base !mt-6">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'دخول'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-emerald-500/35 text-xs mt-6">وقار © {new Date().getFullYear()}</p>
      </motion.div>
    </div>
  );
}
