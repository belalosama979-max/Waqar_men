'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Calendar, BookOpen, Mic, BarChart3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { studentsRepository, recitationsRepository } from '@/lib/db';
import { RecitationDialog } from '@/components/shared/RecitationDialog';
import { formatArabicDate, getEvaluationLabel, getEvaluationBadgeColor } from '@/lib/utils';
import { DEFAULT_EVALUATIONS } from '@/lib/constants';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Student, Recitation } from '@/types';

export default function StudentProfilePage() {
  // useSearchParams needs a Suspense boundary in a statically exported app
  return (
    <Suspense fallback={<div className="p-4"><TableSkeleton rows={5} /></div>}>
      <StudentProfile />
    </Suspense>
  );
}

function StudentProfile() {
  const searchParams = useSearchParams();
  const studentId = Number(searchParams.get('id'));

  const [student, setStudent] = useState<Student | null>(null);
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [evalStats, setEvalStats] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{ date: string; points: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [st, recs, stats, chart] = await Promise.all([
        studentsRepository.getById(studentId),
        recitationsRepository.getByStudentId(studentId),
        recitationsRepository.getEvaluationStats(studentId),
        recitationsRepository.getChartData(studentId),
      ]);
      setStudent(st || null);
      setRecitations(recs);
      setEvalStats(stats);
      setChartData(chart);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const [undoTarget, setUndoTarget] = useState<Recitation | null>(null);

  const handleDeleteRecitation = async (rec: Recitation) => {
    setUndoTarget(null);
    setDeletingId(rec.id!);
    try {
      await recitationsRepository.delete(rec.id!);
      await studentsRepository.addPointsAndPages(
        studentId, 
        -rec.totalPoints, 
        -(rec.pagesCount || 0), 
        -(rec.hadithsCount || 0)
      );
      await studentsRepository.recalculateLastRecitation(studentId);
      toast.success('تم التراجع عن التسميع وخصم النقاط بنجاح');
      load();
    } catch {
      toast.error('حدث خطأ أثناء التراجع');
    } finally {
      setDeletingId(null);
    }
  };

  if (!loading && !student) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-emerald-400/50">الطالب غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        className="glass-card-gold p-5 sm:p-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 w-16 bg-emerald-900/50 rounded-2xl" />
            <div className="h-6 w-48 bg-emerald-900/50 rounded" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 text-gold-200"
                style={{
                  background: 'linear-gradient(145deg, rgba(217,180,90,0.32), rgba(150,100,20,0.12))',
                  border: '1px solid rgba(217,180,90,0.4)',
                }}
              >
                {student?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-50 truncate">{student?.name}</h1>
                <p className="text-sm text-emerald-300/55 truncate">
                  {student?.teacherName}
                  {student?.course ? ` • ${student.course}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-gold-400" />
                    <span className="text-gradient-gold font-extrabold">
                      {student?.totalPoints.toLocaleString('ar-SA')} نقطة
                    </span>
                  </span>
                  {student?.lastDate && (
                    <span className="flex items-center gap-1.5 text-emerald-300/70 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {formatArabicDate(student.lastDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="btn-emerald justify-center w-full sm:w-auto flex-shrink-0" onClick={() => setDialogOpen(true)}>
              <Mic className="w-4 h-4" />
              تسجيل تسميع
            </button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5">
        {DEFAULT_EVALUATIONS.map((ev, i) => (
          <motion.div
            key={ev.key}
            className="glass-card px-2 py-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-2xl font-extrabold text-emerald-100 tabular-nums">{evalStats[ev.key] || 0}</p>
            <p className="text-[11px] text-emerald-300/55 mt-1 leading-tight">{ev.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Points Chart */}
      {chartData.length > 1 && (
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-200">مسار النقاط</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(167,243,208,0.5)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(167,243,208,0.5)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,20,12,0.95)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '8px',
                  color: '#ecfdf5',
                  fontFamily: 'Cairo, sans-serif',
                }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6, fill: '#6ee7b7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recitation History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-emerald-500/10 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-200">سجل التسميع</h3>
          <span className="text-xs text-emerald-500/50">({recitations.length} جلسة)</span>
        </div>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={5} /></div>
        ) : recitations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-emerald-400/50">لا يوجد سجل تسميع بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-500/5">
            {recitations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                className="p-4 table-row-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-200">
                      {rec.surahName || (rec.type === 'جزء' ? `الجزء ${rec.part}` : '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getEvaluationBadgeColor(rec.evaluation)}`}>
                      {getEvaluationLabel(rec.evaluation)}
                    </span>
                    <button
                      onClick={() => setUndoTarget(rec)}
                      disabled={deletingId === rec.id}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-red-300/70 active:scale-90 transition-transform disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)' }}
                      title="تراجع عن التسميع"
                      aria-label="تراجع عن التسميع"
                    >
                      {deletingId === rec.id ? (
                        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-500/50">
                  <span>{formatArabicDate(rec.date)}</span>
                  <span className="text-gold-400 font-semibold">+{rec.totalPoints} نقطة</span>
                </div>
                {rec.extraPoints > 0 && (
                  <p className="text-xs text-emerald-500/40 mt-0.5">
                    ({rec.evalPoints} تقييم + {rec.extraPoints} إضافية)
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!undoTarget}
        title="التراجع عن التسميع"
        message="هل أنت متأكد من التراجع عن هذا التسميع وخصم النقاط الخاصة به؟"
        confirmText="تراجع"
        onConfirm={() => undoTarget && handleDeleteRecitation(undoTarget)}
        onCancel={() => setUndoTarget(null)}
      />

      {student && (
        <RecitationDialog
          student={student}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
