'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Key, Users, X, Check } from 'lucide-react';
import { teachersRepository, studentsRepository } from '@/lib/db';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { generateTeacherPassword } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { COURSES_LIST } from '@/types';
import type { Teacher, CourseType } from '@/types';

interface TeacherFormState {
  name: string;
  username: string;
  course: CourseType;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherFormState>({ name: '', username: '', course: 'المساق الحر' });
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const list = await teachersRepository.getAll();
    const counts: Record<number, number> = {};
    for (const t of list) {
      counts[t.id!] = await studentsRepository.count(t.id!);
    }
    setTeachers(list);
    setStudentCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingTeacher(null);
    setForm({ name: '', username: '', course: 'المساق الحر' });
    setFormOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setForm({ name: teacher.name, username: teacher.username, course: teacher.course || 'المساق الحر' });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('يرجى إدخال اسم المعلم');
      return;
    }
    setSaving(true);
    try {
      if (editingTeacher) {
        await teachersRepository.update(editingTeacher.id!, {
          name: form.name,
          username: form.username || form.name.split(' ')[0],
          course: form.course,
        });
        toast.success('تم تعديل المعلم بنجاح');
      } else {
        const username = form.username || form.name.split(' ')[0];
        const password = generateTeacherPassword(form.name);
        await teachersRepository.add({
          name: form.name,
          username,
          password,
          course: form.course,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(`تم إضافة المعلم بنجاح! كلمة المرور: ${password}`);
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
    await teachersRepository.delete(deleteTarget.id!);
    toast.success('تم حذف المعلم');
    setDeleteTarget(null);
    load();
  };

  const handleResetPassword = async (teacher: Teacher) => {
    const newPassword = generateTeacherPassword(teacher.name);
    await teachersRepository.update(teacher.id!, { password: newPassword });
    toast.success(`تم إعادة تعيين كلمة المرور: ${newPassword}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-100">إدارة المعلمين</h2>
            <p className="text-xs text-emerald-500/50">{teachers.length} معلم</p>
          </div>
        </div>
        <motion.button
          className="btn-emerald"
          onClick={openAdd}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
          إضافة معلم
        </motion.button>
      </div>

      {/* Teacher Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-4"><TableSkeleton rows={5} /></div>
        ) : teachers.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-5xl mb-4">👨‍🏫</p>
            <p className="text-emerald-400/50">لا يوجد معلمون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">المساق</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">اسم المستخدم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الطلاب</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, idx) => (
                  <motion.tr
                    key={teacher.id}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid rgba(16,185,129,0.05)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td className="px-4 py-3 text-sm text-emerald-500/50">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="font-medium text-emerald-100">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${teacher.course === 'الأربعين البخارية' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-blue-500/15 text-blue-400 border-blue-500/25'}`}>
                        {teacher.course || 'المساق الحر'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-300/60">{teacher.username}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                        {studentCounts[teacher.id!] || 0} طالب
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(teacher)}
                          className="p-1.5 rounded-lg text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(teacher)}
                          className="p-1.5 rounded-lg text-gold-400/50 hover:text-gold-400 hover:bg-gold-500/10 transition-all"
                          title="إعادة تعيين كلمة المرور"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(teacher)}
                          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="w-full max-w-md glass-card p-6"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-emerald-100">
                    {editingTeacher ? 'تعديل المعلم' : 'إضافة معلم جديد'}
                  </h3>
                  <button onClick={() => setFormOpen(false)} className="text-emerald-400/40 hover:text-emerald-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">الاسم الكامل</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-glass"
                      placeholder="مثال: محمد أحمد"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">اسم المستخدم (اختياري)</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="input-glass"
                      placeholder="إذا تركته فارغاً سيتم استخدام الاسم الأول"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">مساق المعلم</label>
                    <select
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value as CourseType })}
                      className="select-glass w-full"
                    >
                      {COURSES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {!editingTeacher && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <p className="text-xs text-gold-400/70">
                        💡 كلمة المرور التلقائية: الاسم الأول + 123
                        {form.name && <span className="font-bold"> ({form.name.split(' ')[0]}123)</span>}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setFormOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm text-emerald-300/70 hover:text-emerald-300 transition-colors" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      إلغاء
                    </button>
                    <motion.button
                      className="flex-1 btn-emerald justify-center py-2.5"
                      onClick={handleSave}
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> حفظ</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف المعلم"
        message={`هل أنت متأكد من حذف المعلم "${deleteTarget?.name}"؟ سيتم فصل جميع طلابه.`}
        confirmText="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
