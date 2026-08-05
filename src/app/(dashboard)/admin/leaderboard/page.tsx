'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Globe } from 'lucide-react';
import { studentsRepository, teachersRepository } from '@/lib/db';
import { formatShortDate, getRankEmoji } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/Skeleton';
import type { Student, Teacher } from '@/types';

export default function AdminLeaderboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'byTeacher'>('global');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('جميع المساقات (مشتركة)');
  const [sortBy, setSortBy] = useState<'points' | 'pages' | 'hadiths'>('points');

  const load = useCallback(async (course?: string) => {
    const [allStudents, allTeachers] = await Promise.all([
      studentsRepository.getLeaderboard(undefined, course),
      teachersRepository.getAll(),
    ]);
    setStudents(allStudents);
    setTeachers(allTeachers);
    setLoading(false);
  }, []);

  useEffect(() => { load(selectedCourse); }, [load, selectedCourse]);

  const displayedStudents = (tab === 'global'
    ? students
    : selectedTeacher
    ? students.filter((s) => String(s.teacherId) === selectedTeacher)
    : students).sort((a, b) => {
      if (sortBy === 'points') return (b.totalPoints || 0) - (a.totalPoints || 0);
      if (sortBy === 'hadiths') return (b.totalHadiths || 0) - (a.totalHadiths || 0);
      return (b.totalPages || 0) - (a.totalPages || 0);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="glass-card-gold p-6 flex items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <Trophy className="w-7 h-7 text-gold-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gradient-gold">لوحة الشرف العامة</h2>
          <p className="text-sm text-emerald-400/50">ترتيب جميع الطلاب حسب النقاط</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-emerald-500/20">
        <button
          onClick={() => setTab('global')}
          className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === 'global' ? 'bg-emerald-700/40 text-emerald-300' : 'text-emerald-400/50 hover:bg-emerald-900/20'}`}
        >
          <Globe className="w-4 h-4" />
          الترتيب العام
        </button>
        <button
          onClick={() => setTab('byTeacher')}
          className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === 'byTeacher' ? 'bg-emerald-700/40 text-emerald-300' : 'text-emerald-400/50 hover:bg-emerald-900/20'}`}
        >
          <Medal className="w-4 h-4" />
          حسب المعلم
        </button>
      </div>

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
      <div className="flex gap-3 flex-col sm:flex-row">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="select-glass flex-1">
          <option value="جميع المساقات (مشتركة)">جميع المساقات (مشتركة)</option>
          {['المساق الحر', 'آلاء الرحمن', 'الأربعين البخارية'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {tab === 'byTeacher' && (
          <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="select-glass flex-1">
            <option value="">جميع المعلمين</option>
            {teachers.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Top 3 */}
      {!loading && displayedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          <motion.div className="glass-card p-4 text-center pt-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="text-3xl mb-2">🥈</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{displayedStudents[1]?.name}</p>
            <p className="text-xs text-emerald-500/40">{displayedStudents[1]?.teacherName}</p>
            <p className="text-gold-400 font-bold mt-1">
              {sortBy === 'points' ? displayedStudents[1]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? displayedStudents[1]?.totalHadiths?.toLocaleString('ar-SA') : displayedStudents[1]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-emerald-500/40">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
          <motion.div className="glass-card-gold p-4 text-center -mt-4" style={{ boxShadow: '0 0 30px rgba(251,191,36,0.2)' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="text-4xl mb-2">🥇</div>
            <p className="font-bold text-gold-300 text-sm truncate">{displayedStudents[0]?.name}</p>
            <p className="text-xs text-gold-500/50">{displayedStudents[0]?.teacherName}</p>
            <p className="text-gold-400 font-bold text-lg mt-1">
              {sortBy === 'points' ? displayedStudents[0]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? displayedStudents[0]?.totalHadiths?.toLocaleString('ar-SA') : displayedStudents[0]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gold-500/60">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
          <motion.div className="glass-card p-4 text-center pt-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-3xl mb-2">🥉</div>
            <p className="font-bold text-emerald-200 text-sm truncate">{displayedStudents[2]?.name}</p>
            <p className="text-xs text-emerald-500/40">{displayedStudents[2]?.teacherName}</p>
            <p className="text-gold-400 font-bold mt-1">
              {sortBy === 'points' ? displayedStudents[2]?.totalPoints.toLocaleString('ar-SA') : sortBy === 'hadiths' ? displayedStudents[2]?.totalHadiths?.toLocaleString('ar-SA') : displayedStudents[2]?.totalPages.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-emerald-500/40">{sortBy === 'points' ? 'نقطة' : sortBy === 'hadiths' ? 'حديث' : 'صفحة'}</p>
          </motion.div>
        </div>
      )}

      {/* Full Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-emerald-500/10">
          <h3 className="font-semibold text-emerald-200">الترتيب الكامل</h3>
        </div>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={10} /></div>
        ) : displayedStudents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-emerald-400/50">لا يوجد طلاب</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الترتيب</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الطالب</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">المعلم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">النقاط</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الصفحات</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الأحاديث</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">آخر تسميع</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((student, idx) => (
                  <motion.tr key={student.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(16,185,129,0.05)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${idx < 3 ? 'text-gold-400' : 'text-emerald-500/50'}`}>
                        {getRankEmoji(idx + 1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: idx < 3 ? 'rgba(251,191,36,0.15)' : 'rgba(16,185,129,0.1)', border: idx < 3 ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(16,185,129,0.15)' }}>
                          {student.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${idx < 3 ? 'text-gold-200' : 'text-emerald-100'}`}>{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-300/60">{student.teacherName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gold-400">{student.totalPoints.toLocaleString('ar-SA')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-300">{student.totalPages.toLocaleString('ar-SA')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-300">{student.totalHadiths?.toLocaleString('ar-SA') || '0'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-400/50">{student.lastDate ? formatShortDate(student.lastDate) : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
