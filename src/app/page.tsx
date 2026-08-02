'use client';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Star, Shield, Smartphone, Download, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    setShowInstallModal(true);
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallModal(false);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: <BookOpen className="w-6 h-6" />, title: 'متابعة التسميع', desc: 'سجل دقيق لتسميع الطلاب مع التقييمات والنقاط.' },
    { icon: <Star className="w-6 h-6" />, title: 'نظام نقاط تحفيزي', desc: 'تشجيع الطلاب بنقاط ومكافآت وتصدر لوحة الشرف.' },
    { icon: <Shield className="w-6 h-6" />, title: 'صلاحيات متعددة', desc: 'إدارة متكاملة للمشرفين والمعلمين بمرونة عالية.' },
    { icon: <Smartphone className="w-6 h-6" />, title: 'تطبيق سريع', desc: 'إمكانية تثبيت النظام كتطبيق على هاتفك الذكي.' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-cairo bg-[#0a0f0a]">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center absolute top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-6 h-6 text-emerald-950" />
          </div>
          <span className="font-bold text-2xl text-emerald-50 tracking-wide">وقار</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-800/50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:block">تثبيت التطبيق</span>
          </button>
          {isAuthenticated ? (
            <Link
              href={user?.role === 'admin' ? '/admin' : '/teacher'}
              className="btn-emerald px-6 py-2 rounded-xl text-sm font-bold"
            >
              لوحة التحكم
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-emerald px-6 py-2 rounded-xl text-sm font-bold"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 overflow-hidden pt-28 pb-10">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center z-10 max-w-4xl w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-8">
            <Star className="w-4 h-4 text-gold-400" />
            النظام الأفضل لإدارة الحلقات القرآنية
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200 mb-8 leading-tight drop-shadow-sm">
            ارتقِ بإدارة حلقتك<br />إلى مستوى جديد
          </h1>
          
          <p className="text-lg md:text-2xl text-emerald-100/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            منصة متكاملة مصممة خصيصاً لمتابعة تسميع الطلاب، وإدارة تقييماتهم، وتحفيزهم عبر نظام نقاط تفاعلي. كل ما تحتاجه في مكان واحد، سريع وآمن.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href={user?.role === 'admin' ? '/admin' : '/teacher'}
                className="btn-emerald px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
              >
                المتابعة للوحة التحكم
                <ArrowLeft className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-emerald px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
              >
                ابدأ الاستخدام الآن
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <button
              onClick={handleInstallClick}
              className="px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all backdrop-blur-sm hover:scale-105"
            >
              <Download className="w-5 h-5" />
              تثبيت على الجهاز
            </button>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="py-24 px-4 relative z-10 bg-black/40 border-t border-emerald-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-50 mb-4">لماذا تختار وقار؟</h2>
            <p className="text-emerald-400/60 text-lg">مميزات تجعل إدارة الحلقات أسهل وأكثر متعة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-emerald-500/10"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-900/80 to-emerald-800/40 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-emerald-100 mb-3">{feature.title}</h3>
                <p className="text-emerald-400/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center border-t border-emerald-900/20 relative z-10 bg-black/60">
        <p className="text-emerald-500/40 text-sm font-medium">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - نظام وقار لإدارة الحلقات
        </p>
      </footer>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowInstallModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-md bg-emerald-950 border border-emerald-500/30 p-6 rounded-3xl z-50 shadow-2xl shadow-emerald-900/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-emerald-100">تثبيت التطبيق على جهازك</h3>
                <button onClick={() => setShowInstallModal(false)} className="p-1 text-emerald-500/50 hover:text-emerald-400 bg-emerald-500/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-500/10">
                  <h4 className="font-bold text-emerald-300 mb-2 flex items-center gap-2">
                    <span className="text-xl">🍎</span> لأجهزة آيفون (iOS)
                  </h4>
                  <p className="text-sm text-emerald-100/70 leading-relaxed">
                    1. افتح هذا الموقع باستخدام متصفح <strong>Safari</strong>.<br/>
                    2. اضغط على زر المشاركة (مربع يخرج منه سهم) في أسفل الشاشة.<br/>
                    3. اختر <strong>"إضافة للشاشة الرئيسية" (Add to Home Screen)</strong>.
                  </p>
                </div>
                
                <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-500/10">
                  <h4 className="font-bold text-emerald-300 mb-2 flex items-center gap-2">
                    <span className="text-xl">🤖</span> لأجهزة أندرويد (Android)
                  </h4>
                  <p className="text-sm text-emerald-100/70 leading-relaxed">
                    1. افتح الموقع من متصفح <strong>Chrome</strong>.<br/>
                    2. اضغط على القائمة (الثلاث نقاط) في أعلى الشاشة.<br/>
                    3. اختر <strong>"إضافة للشاشة الرئيسية" (Add to Home screen)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {deferredPrompt && (
                  <button onClick={handleNativeInstall} className="btn-emerald py-3 rounded-xl font-bold w-full justify-center">
                    تثبيت مباشر الآن
                  </button>
                )}
                <button onClick={() => setShowInstallModal(false)} className="py-3 rounded-xl font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors w-full">
                  فهمت، شكراً
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
