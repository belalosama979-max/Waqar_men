'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { studentsRepository } from '@/lib/db';
import { formatShortDate, getRankEmoji } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/Skeleton';
import type { Student } from '@/types';

export default function TeacherLeaderboardPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('جميع المساقات (مشتركة)');
  const [sortBy, setSortBy] = useState<'points' | 'pages' | 'hadiths'>('points');

  const load = useCallback(async (course?: string) => {
    if (!user) return;
    const list = await studentsRepository.getLeaderboard(user.id, course);
    setStudents(list);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(selectedCourse); }, [load, selectedCourse]);

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'points') return (b.totalPoints || 0) - (a.totalPoints || 0);
    if (sortBy === 'hadiths') return (b.totalHadiths || 0) - (a.totalHadiths || 0);
    return (b.totalPages || 0) - (a.totalPages || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="glass-card-gold p-6 flex items-center gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <Trophy className="w-7 h-7 text-gold-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gradient-gold">لوحة شرف الصف</h2>
          <p className="text-sm text-emerald-400/50">ترتيب طلابك حسب {sortBy === 'points' ? 'النقاط' : 'عدد الصفحات'}</p>
        </div>
      </motion.div>

      {/* Sort Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-emerald-500/20">
        <button
          onClick={() => setSortBy('points')}
          className={`flex-1 py-2 text-sm font-semibold transition-all ${sortBy === 'points' ? 'bg-emerald-700/40 text-emerald-300' : 'text-emerald-400/50 hover:bg-emerald-900/20'}`}
        >
          الترتيب بالنقاط
        </button>
        <button
          onClick={() => setSortBy('pages')}
          className={`flex-1 py-2 text-sm font-semibold transition-all ${sortBy === 'pages' ? 'bg-emerald-700/40 text-emerald-300' : 'text-emerald-400/50 hover:bg-emerald-900/20'}`}
        >
          الترتيب بالصفحات
        </button>
        <button
          onClick={() => setSortBy('hadiths')}
          className={`flex-1 py-2 text-sm font-semibold transition-all ${sortBy === 'hadiths' ? 'bg-emerald-700/40 text-emerald-300' : 'text-emerald-400/50 hover:bg-emerald-900/20'}`}
        >
          الترتيب بالأحاديث
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="select-glass w-full">
          <option value="جميع المساقات (مشتركة)">جميع المساقات (مشتركة)</option>
          {['المساق الحر', 'آلاء الرحمن', 'الأربعين البخارية', 'الأربعين النووية'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Top 3 Podium */}
      {!loading && sortedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {/* 2nd */}
          <motion.div
            className="glass-card p-4 text-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-3xl mb-2">🥈</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{sortedStudents[1]?.name}</p>
            <p className="text-gold-400 font-bold mt-1">
              {sortBy === 'points' ? sortedStudents[1]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? sortedStudents[1]?.totalHadiths?.toLocaleString('ar-SA') : sortedStudents[1]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-emerald-500/40">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
          {/* 1st */}
          <motion.div
            className="glass-card-gold p-4 text-center -mt-4"
            style={{ boxShadow: '0 0 30px rgba(251,191,36,0.2)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl mb-2">🥇</div>
            <p className="font-bold text-gold-300 text-sm truncate">{sortedStudents[0]?.name}</p>
            <p className="text-gold-400 font-bold text-lg mt-1">
              {sortBy === 'points' ? sortedStudents[0]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? sortedStudents[0]?.totalHadiths?.toLocaleString('ar-SA') : sortedStudents[0]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gold-500/60">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
          {/* 3rd */}
          <motion.div
            className="glass-card p-4 text-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl mb-2">🥉</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{sortedStudents[2]?.name}</p>
            <p className="text-gold-400 font-bold mt-1">
              {sortBy === 'points' ? sortedStudents[2]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? sortedStudents[2]?.totalHadiths?.toLocaleString('ar-SA') : sortedStudents[2]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-emerald-500/40">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
        </div>
      )}

      {/* Full Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-emerald-500/10 flex items-center gap-2">
          <Medal className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-200">الترتيب الكامل</h3>
        </div>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} /></div>
        ) : sortedStudents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-emerald-400/50">لا يوجد طلاب بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-500/5">
            {sortedStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                className="flex items-center gap-4 px-4 py-3 table-row-hover"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <span className="w-10 text-center font-bold text-lg text-emerald-300/80">
                  {getRankEmoji(idx + 1)}
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-100 truncate">{student.name}</p>
                  <p className="text-xs text-emerald-500/40">
                    {student.lastDate ? formatShortDate(student.lastDate) : 'لم يُسمّع بعد'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gold-400 text-sm">
                      {student.totalPoints.toLocaleString('ar-SA')}
                    </p>
                    <p className="text-xs text-emerald-500/40">نقطة</p>
                  </div>
                  <div className="text-right w-14">
                    <p className="font-bold text-emerald-300 text-sm">
                      {student.totalPages.toLocaleString('ar-SA')}
                    </p>
                    <p className="text-xs text-emerald-500/40">صفحة</p>
                  </div>
                  <div className="text-right w-14">
                    <p className="font-bold text-emerald-300 text-sm">
                      {student.totalHadiths?.toLocaleString('ar-SA') || '0'}
                    </p>
                    <p className="text-xs text-emerald-500/40">حديث</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
