'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Calendar, BookOpen, Mic, BarChart3, Trash2 } from 'lucide-react';
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
import type { Student, Recitation } from '@/types';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);

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

  const handleDeleteRecitation = async (recId: number, pointsToDeduct: number) => {
    if (!confirm('هل أنت متأكد من التراجع عن هذا التسميع وخصم النقاط الخاصة به؟')) return;
    
    setDeletingId(recId);
    try {
      await recitationsRepository.delete(recId);
      await studentsRepository.addPoints(studentId, -pointsToDeduct);
      toast.success('تم التراجع عن التسميع وخصم النقاط بنجاح');
      load();
    } catch (err) {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-emerald-400/60 hover:text-emerald-400 transition-colors text-sm"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      {/* Profile Header */}
      <motion.div
        className="glass-card-gold p-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 w-16 bg-emerald-900/50 rounded-2xl" />
            <div className="h-6 w-48 bg-emerald-900/50 rounded" />
          </div>
        ) : (
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(217,119,6,0.3), rgba(180,83,9,0.2))',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            >
              {student?.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-emerald-100 mb-1">{student?.name}</h1>
              <p className="text-sm text-emerald-400/60 mb-3">{student?.teacherName}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-300 font-bold">
                    {student?.totalPoints.toLocaleString('ar-SA')} نقطة
                  </span>
                </div>
                {student?.lastDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm">
                      آخر تسميع: {formatArabicDate(student.lastDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <motion.button
              className="btn-emerald flex-shrink-0"
              onClick={() => setDialogOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Mic className="w-4 h-4" />
              تسجيل تسميع
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DEFAULT_EVALUATIONS.map((ev, i) => (
          <motion.div
            key={ev.key}
            className="glass-card p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-2xl font-bold text-emerald-300">{evalStats[ev.key] || 0}</p>
            <p className="text-xs text-emerald-500/50 mt-1 leading-tight">{ev.label}</p>
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
                      onClick={() => handleDeleteRecitation(rec.id, rec.totalPoints)}
                      disabled={deletingId === rec.id}
                      className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="تراجع عن التسميع"
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
