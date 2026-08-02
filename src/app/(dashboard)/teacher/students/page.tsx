'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { studentsRepository } from '@/lib/db';
import { StudentCard } from '@/components/shared/StudentCard';
import { StudentCardSkeleton } from '@/components/shared/Skeleton';
import { Search, GraduationCap } from 'lucide-react';
import type { Student } from '@/types';

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const list = await studentsRepository.getByTeacherId(user.id);
    setStudents(list);
    setLoading(false);
  }, [user]);


  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-100">طلابي</h2>
            <p className="text-xs text-emerald-500/50">{students.length} طالب</p>
          </div>
        </div>
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <StudentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">📚</div>
          <p className="text-emerald-400/50 text-lg">
            {search ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((student, idx) => (
            <StudentCard
              key={student.id}
              student={student}
              index={idx}
              onRecitationSaved={load}
              onClick={() => router.push(`/teacher/students/${student.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
