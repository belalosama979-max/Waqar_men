'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  CalendarDays,
  Trophy,
  Activity,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { teachersRepository, studentsRepository, recitationsRepository } from '@/lib/db';
import { StatCard } from '@/components/shared/StatCard';
import { StatCardSkeleton } from '@/components/shared/Skeleton';
import { formatArabicDate, getEvaluationLabel } from '@/lib/utils';
import type { Recitation, Student } from '@/types';

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24'];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    todayRecitations: 0,
    weekRecitations: 0,
    monthRecitations: 0,
  });
  const [bestStudent, setBestStudent] = useState<Student | null>(null);
  const [recentActivity, setRecentActivity] = useState<Recitation[]>([]);
  const [evalChartData, setEvalChartData] = useState<{ name: string; value: number }[]>([]);
  const [teacherBarData, setTeacherBarData] = useState<{ name: string; students: number; points: number }[]>([]);

  const load = useCallback(async () => {
    const [teachers, students, today, week, month, recent] = await Promise.all([
      teachersRepository.count(),
      studentsRepository.count(),
      recitationsRepository.getTodayCount(),
      recitationsRepository.getWeekCount(),
      recitationsRepository.getMonthCount(),
      recitationsRepository.getRecent(10),
    ]);

    const allStudents = await studentsRepository.getAll();
    const best = allStudents.sort((a, b) => b.totalPoints - a.totalPoints)[0] || null;

    // Build teacher bar chart
    const allTeachers = await teachersRepository.getAll();
    const barData = await Promise.all(
      allTeachers.map(async (t) => {
        const teacherStudents = await studentsRepository.getByTeacherId(t.id!);
        const totalPoints = teacherStudents.reduce((s, st) => s + st.totalPoints, 0);
        return { name: t.name.split(' ')[0], students: teacherStudents.length, points: totalPoints };
      })
    );

    // Build evaluation pie
    const allRecitations = await recitationsRepository.getAll();
    const evalCounts: Record<string, number> = {};
    for (const r of allRecitations) {
      evalCounts[r.evaluation] = (evalCounts[r.evaluation] || 0) + 1;
    }
    const pieData = Object.entries(evalCounts).map(([k, v]) => ({
      name: getEvaluationLabel(k),
      value: v,
    }));

    setStats({ totalTeachers: teachers, totalStudents: students, todayRecitations: today, weekRecitations: week, monthRecitations: month });
    setBestStudent(best);
    setRecentActivity(recent);
    setEvalChartData(pieData);
    setTeacherBarData(barData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="المعلمون" value={stats.totalTeachers} icon={<Users className="w-6 h-6" />} color="emerald" delay={0} />
            <StatCard title="الطلاب" value={stats.totalStudents} icon={<GraduationCap className="w-6 h-6" />} color="gold" delay={0.05} />
            <StatCard title="تسميع اليوم" value={stats.todayRecitations} icon={<CalendarDays className="w-6 h-6" />} color="blue" delay={0.1} />
            <StatCard title="تسميع الأسبوع" value={stats.weekRecitations} icon={<Activity className="w-6 h-6" />} color="purple" delay={0.15} />
            <StatCard title="تسميع الشهر" value={stats.monthRecitations} icon={<TrendingUp className="w-6 h-6" />} color="emerald" delay={0.2} />
          </>
        )}
      </div>

      {/* Best Student */}
      {bestStudent && (
        <motion.div
          className="glass-card-gold p-5 flex items-center gap-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Trophy className="w-8 h-8 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-gold-500/70 mb-0.5">🏆 أفضل طالب</p>
            <p className="text-xl font-bold text-gold-300">{bestStudent.name}</p>
            <p className="text-sm text-emerald-400/60">
              {bestStudent.totalPoints.toLocaleString('ar-SA')} نقطة • {bestStudent.teacherName}
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Bar Chart */}
        {teacherBarData.length > 0 && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-200">المعلمون والطلاب</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teacherBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(167,243,208,0.5)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'rgba(167,243,208,0.5)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,20,12,0.95)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '8px',
                    color: '#ecfdf5',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                />
                <Bar dataKey="students" fill="#10b981" name="الطلاب" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Evaluation Pie Chart */}
        {evalChartData.length > 0 && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-200">توزيع التقييمات</h3>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={160}>
                <PieChart>
                  <Pie
                    data={evalChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {evalChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,20,12,0.95)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '8px',
                      color: '#ecfdf5',
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {evalChartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-emerald-300/70 truncate">{d.name}</span>
                    <span className="text-emerald-400 font-semibold mr-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="p-4 border-b border-emerald-500/10 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-200">آخر النشاطات</h3>
          </div>
          <div className="divide-y divide-emerald-500/5">
            {recentActivity.map((rec, idx) => (
              <motion.div
                key={rec.id}
                className="flex items-center gap-3 px-4 py-3 table-row-hover"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  {(rec.studentName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-200 truncate">{rec.studentName}</p>
                  <p className="text-xs text-emerald-500/40 truncate">
                    {rec.surahName} • {rec.teacherName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gold-400">+{rec.totalPoints}</p>
                  <p className="text-xs text-emerald-500/40">{formatArabicDate(rec.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
