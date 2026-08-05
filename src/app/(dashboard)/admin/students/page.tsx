'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowLeftRight, Search, X, Check, GraduationCap } from 'lucide-react';
import { studentsRepository, teachersRepository } from '@/lib/db';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { formatShortDate } from '@/lib/utils';
import type { Student, Teacher, CourseType } from '@/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [form, setForm] = useState<{ name: string; teacherId: string; course: CourseType }>({ name: '', teacherId: '', course: 'المساق الحر' });
  const [newTeacherId, setNewTeacherId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [allStudents, allTeachers] = await Promise.all([
      studentsRepository.getAll(),
      teachersRepository.getAll(),
    ]);
    setStudents(allStudents);
    setTeachers(allTeachers);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchesTeacher = !filterTeacher || String(s.teacherId) === filterTeacher;
    return matchesSearch && matchesTeacher;
  });

  const openAdd = () => {
    setEditingStudent(null);
    setForm({ name: '', teacherId: teachers[0] ? String(teachers[0].id) : '', course: 'المساق الحر' });
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ name: student.name, teacherId: String(student.teacherId), course: student.course || 'المساق الحر' });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.teacherId) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setSaving(true);
    try {
      const teacher = teachers.find((t) => String(t.id) === form.teacherId);
      if (editingStudent) {
        await studentsRepository.update(editingStudent.id!, {
          name: form.name,
          teacherId: Number(form.teacherId),
          teacherName: teacher?.name,
          course: form.course,
        });
        toast.success('تم تعديل الطالب بنجاح');
      } else {
        await studentsRepository.add({
          name: form.name,
          teacherId: Number(form.teacherId),
          teacherName: teacher?.name,
          course: form.course,
          totalPoints: 0,
          totalPages: 0,
          totalHadiths: 0,
          lastRecitation: null,
          lastDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success('تم إضافة الطالب بنجاح');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferStudent || !newTeacherId) return;
    const teacher = teachers.find((t) => String(t.id) === newTeacherId);
    await studentsRepository.transferToTeacher(transferStudent.id!, Number(newTeacherId), teacher?.name || '');
    toast.success(`تم نقل ${transferStudent.name} إلى ${teacher?.name}`);
    setTransferStudent(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await studentsRepository.delete(deleteTarget.id!);
    toast.success('تم حذف الطالب');
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-100">إدارة الطلاب</h2>
            <p className="text-xs text-emerald-500/50">{students.length} طالب</p>
          </div>
        </div>
        <motion.button className="btn-emerald" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Plus className="w-4 h-4" />
          إضافة طالب
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن طالب..." className="input-glass pr-10" />
        </div>
        <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)} className="select-glass sm:w-48">
          <option value="">جميع المعلمين</option>
          {teachers.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-5xl mb-4">🎓</p>
            <p className="text-emerald-400/50">{search ? 'لا توجد نتائج' : 'لا يوجد طلاب'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الطالب</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">المعلم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">النقاط</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">آخر تسميع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-400/60">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, idx) => (
                  <motion.tr key={student.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(16,185,129,0.05)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                    <td className="px-4 py-3 text-sm text-emerald-500/50">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-emerald-100">{student.name}</span>
                          <span className="text-[10px] text-emerald-500/60">{student.course || 'المساق الحر'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-300/60">{student.teacherName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gold-400">{student.totalPoints.toLocaleString('ar-SA')}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-400/50">
                      {student.lastDate ? formatShortDate(student.lastDate) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="تعديل">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setTransferStudent(student); setNewTeacherId(''); }} className="p-1.5 rounded-lg text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="نقل">
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(student)} className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all" title="حذف">
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

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div className="w-full max-w-md glass-card p-6" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-emerald-100">{editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}</h3>
                  <button onClick={() => setFormOpen(false)} className="text-emerald-400/40 hover:text-emerald-400 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">اسم الطالب</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="اسم الطالب الكامل" />
                  </div>
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">المعلم</label>
                    <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="select-glass">
                      <option value="">— اختر المعلم —</option>
                      {teachers.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-emerald-300/70 mb-1.5 block">المساق</label>
                    <select
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value as any })}
                      className="select-glass w-full"
                    >
                      {['المساق الحر', 'آلاء الرحمن', 'الأربعين البخارية', 'الأربعين النووية'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setFormOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm text-emerald-300/70 hover:text-emerald-300 transition-colors" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>إلغاء</button>
                    <motion.button className="flex-1 btn-emerald justify-center py-2.5" onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> حفظ</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transfer Dialog */}
      <AnimatePresence>
        {transferStudent && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTransferStudent(null)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div className="w-full max-w-md glass-card p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-emerald-100">نقل الطالب</h3>
                  <button onClick={() => setTransferStudent(null)} className="text-emerald-400/40 hover:text-emerald-400"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-emerald-300/60 mb-4">نقل الطالب <span className="font-bold text-emerald-200">{transferStudent.name}</span> إلى معلم آخر</p>
                <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="select-glass mb-4">
                  <option value="">— اختر المعلم الجديد —</option>
                  {teachers.filter((t) => t.id !== transferStudent.teacherId).map((t) => (
                    <option key={t.id} value={String(t.id)}>{t.name}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button onClick={() => setTransferStudent(null)} className="flex-1 py-2.5 rounded-xl text-sm text-emerald-300/70" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>إلغاء</button>
                  <motion.button className="flex-1 btn-emerald justify-center py-2.5" onClick={handleTransfer} disabled={!newTeacherId} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <ArrowLeftRight className="w-4 h-4" /> نقل
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
