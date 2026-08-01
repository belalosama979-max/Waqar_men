'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Users, CalendarDays, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { studentsRepository, recitationsRepository } from '@/lib/db';
import { StudentCard } from '@/components/shared/StudentCard';
import { StatCard } from '@/components/shared/StatCard';
import { StudentCardSkeleton, StatCardSkeleton } from '@/components/shared/Skeleton';
import type { Student } from '@/types';

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allStudents, todayCount, weekCount] = await Promise.all([
        studentsRepository.getByTeacherId(user.id),
        recitationsRepository.getTodayCount(user.id),
        recitationsRepository.getWeekCount(user.id),
      ]);
      const totalPts = allStudents.reduce((s, st) => s + st.totalPoints, 0);
      setStudents(allStudents);
      setStats({ today: todayCount, week: weekCount, total: totalPts });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = students.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="عدد طلابي"
              value={students.length}
              icon={<GraduationCap className="w-6 h-6" />}
              color="emerald"
              delay={0}
            />
            <StatCard
              title="تسميع اليوم"
              value={stats.today}
              icon={<CalendarDays className="w-6 h-6" />}
              color="gold"
              delay={0.1}
            />
            <StatCard
              title="تسميع الأسبوع"
              value={stats.week}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              delay={0.2}
            />
            <StatCard
              title="مجموع النقاط"
              value={stats.total}
              icon={<Trophy className="w-6 h-6" />}
              color="purple"
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن طالب..."
          className="input-glass pr-10"
        />
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-emerald-300/60 mb-2">
            {search ? 'لا توجد نتائج' : 'لا يوجد طلاب بعد'}
          </h3>
          <p className="text-emerald-500/40 text-sm">
            {search ? 'جرب البحث بكلمة مختلفة' : 'سيظهر طلابك هنا بعد إضافتهم من قِبل المشرف'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((student, idx) => (
            <StudentCard
              key={student.id}
              student={student}
              index={idx}
              onRecitationSaved={loadData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
