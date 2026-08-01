'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BookOpen, Lock, User, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { teachersRepository } from '@/lib/db';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME } from '@/lib/constants';
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

    await new Promise((r) => setTimeout(r, 600)); // smooth UX

    try {
      if (loginMode === 'admin') {
        if (adminUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          login({ id: 0, name: ADMIN_NAME, role: 'admin', username: ADMIN_USERNAME });
          toast.success('مرحباً بك يا مشرف! 🌟');
          router.push('/admin');
        } else {
          toast.error('بيانات الدخول غير صحيحة');
        }
      } else {
        if (!selectedTeacherId) {
          toast.error('الرجاء اختيار اسم المعلم');
          setLoading(false);
          return;
        }
        const teacher = teachers.find((t) => String(t.id) === selectedTeacherId);
        if (!teacher) {
          toast.error('المعلم غير موجود');
          setLoading(false);
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
          router.push('/teacher');
        } else {
          toast.error('كلمة المرور غير صحيحة');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-900/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        {/* Islamic Pattern Dots */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md mx-4"
      >
        {/* Logo & Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.3), rgba(4,120,87,0.2))',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 40px rgba(16,185,129,0.2)',
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BookOpen className="w-10 h-10 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full animate-pulse-gold" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gradient-emerald mb-1">
            نظام إدارة تسميع القرآن
          </h1>
          <p className="text-emerald-300/60 text-sm">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-emerald-500/20 mb-6">
            {(['teacher', 'admin'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setLoginMode(mode);
                  setPassword('');
                  setSelectedTeacherId('');
                  setAdminUsername('');
                }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  loginMode === mode
                    ? 'bg-emerald-700/50 text-emerald-300'
                    : 'text-emerald-300/50 hover:text-emerald-300/70 hover:bg-emerald-900/20'
                }`}
              >
                {mode === 'teacher' ? '👨‍🏫 معلم' : '🛡️ مشرف'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === 'admin' ? (
              /* Admin Username */
              <div>
                <label className="block text-emerald-300/80 text-sm font-medium mb-1.5">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="input-glass pr-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
            ) : (
              /* Teacher Dropdown */
              <div>
                <label className="block text-emerald-300/80 text-sm font-medium mb-1.5">
                  اختر اسم المعلم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60 pointer-events-none z-10" />
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60 pointer-events-none z-10" />
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

            {/* Password */}
            <div>
              <label className="block text-emerald-300/80 text-sm font-medium mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="input-glass pr-10 pl-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginMode === 'teacher' && selectedTeacherId && (
                <p className="text-xs text-emerald-500/50 mt-1 text-right">
                  كلمة المرور: الاسم الأول + 123
                </p>
              )}
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-emerald w-full justify-center py-3 text-base mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  دخول
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Version */}
        <motion.p
          className="text-center text-emerald-500/30 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          نظام إدارة تسميع القرآن الكريم © 2025
        </motion.p>
      </motion.div>
    </div>
  );
}
