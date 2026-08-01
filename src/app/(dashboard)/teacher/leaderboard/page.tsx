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

  const load = useCallback(async () => {
    if (!user) return;
    const list = await studentsRepository.getLeaderboard(user.id);
    setStudents(list);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

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
          <p className="text-sm text-emerald-400/50">ترتيب طلابك حسب النقاط</p>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {!loading && students.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {/* 2nd */}
          <motion.div
            className="glass-card p-4 text-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-3xl mb-2">🥈</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{students[1]?.name}</p>
            <p className="text-gold-400 font-bold mt-1">{students[1]?.totalPoints.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-emerald-500/40">نقطة</p>
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
            <p className="font-bold text-gold-300 text-sm truncate">{students[0]?.name}</p>
            <p className="text-gold-400 font-bold text-lg mt-1">{students[0]?.totalPoints.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-gold-500/60">نقطة</p>
          </motion.div>
          {/* 3rd */}
          <motion.div
            className="glass-card p-4 text-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl mb-2">🥉</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{students[2]?.name}</p>
            <p className="text-gold-400 font-bold mt-1">{students[2]?.totalPoints.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-emerald-500/40">نقطة</p>
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
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-emerald-400/50">لا يوجد طلاب بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-500/5">
            {students.map((student, idx) => (
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
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gold-400 text-sm">
                    {student.totalPoints.toLocaleString('ar-SA')}
                  </p>
                  <p className="text-xs text-emerald-500/40">نقطة</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
