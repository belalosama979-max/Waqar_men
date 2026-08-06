'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { studentsRepository, teachersRepository } from '@/lib/db';
import { StudentCard } from '@/components/shared/StudentCard';
import { StudentCardSkeleton } from '@/components/shared/Skeleton';
import { Search, GraduationCap, Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Student, CourseType, Teacher } from '@/types';

type FormState = { name: string; course: CourseType };

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', course: 'المساق الحر' });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [list, teacherData] = await Promise.all([
      studentsRepository.getByTeacherId(user.id),
      teachersRepository.getById(user.id),
    ]);
    setStudents(list);
    setTeacher(teacherData || null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingStudent(null);
    // Default course = teacher's course
    const defaultCourse = (teacher?.course as CourseType) || 'المساق الحر';
    setForm({ name: '', course: defaultCourse });
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ name: student.name, course: student.course || 'المساق الحر' });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('يرجى إدخال اسم الطالب');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (editingStudent) {
        await studentsRepository.update(editingStudent.id!, {
          name: form.name,
          course: form.course,
        });
        toast.success('تم تعديل بيانات الطالب بنجاح ✅');
      } else {
        await studentsRepository.add({
          name: form.name,
          teacherId: user.id,
          teacherName: user.name,
          course: form.course,
          totalPoints: 0,
          totalPages: 0,
          totalHadiths: 0,
          lastRecitation: null,
          lastDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(`تمت إضافة الطالب "${form.name}" بنجاح 🎉`);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studentsRepository.delete(deleteTarget.id!);
      toast.success('تم حذف الطالب');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const COURSES: CourseType[] = ['المساق الحر', 'آلاء الرحمن', 'الأربعين البخارية', 'الأربعين النووية'];

  return (
    <div className="space-y-5">
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
        <motion.button
          className="btn-emerald"
          onClick={openAdd}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
          إضافة طالب
        </motion.button>
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
            {search ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب — اضغط "إضافة طالب" للبدء'}
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
              onEdit={() => openEdit(student)}
              onDelete={() => setDeleteTarget(student)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
            />
            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                className="w-full sm:max-w-md glass-card p-6 rounded-t-3xl sm:rounded-2xl"
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-100">
                      {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
                    </h3>
                    {!editingStudent && (
                      <p className="text-xs text-emerald-400/50 mt-0.5">سيُضاف تحت حلقتك مباشرة</p>
                    )}
                  </div>
                  <button onClick={() => setFormOpen(false)} className="text-emerald-400/40 hover:text-emerald-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">اسم الطالب</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      className="input-glass"
                      placeholder="مثال: عبدالله محمد"
                      autoFocus
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">المساق</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COURSES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setForm({ ...form, course: c })}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-right ${
                            form.course === c
                              ? 'bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500/50'
                              : 'text-emerald-400/60 border border-emerald-500/15 hover:bg-emerald-900/20'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setFormOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm text-emerald-300/70 hover:text-emerald-300 transition-colors"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                    >
                      إلغاء
                    </button>
                    <motion.button
                      className="flex-1 btn-emerald justify-center py-2.5"
                      onClick={handleSave}
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Check className="w-4 h-4" /> حفظ</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الطالب"
        message={`هل أنت متأكد من حذف الطالب "${deleteTarget?.name}"؟ سيتم حذف جميع سجلات تسميعه.`}
        confirmText="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
