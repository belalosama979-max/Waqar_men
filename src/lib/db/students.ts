import { supabase } from '@/lib/supabase';
import type { Student } from '@/types';

function mapStudent(row: Record<string, unknown>): Student {
  return {
    id: row.id as number,
    name: row.name as string,
    teacherId: row.teacher_id as number,
    teacherName: row.teacher_name as string | undefined,
    totalPoints: (row.total_points as number) ?? 0,
    totalPages: (row.total_pages as number) ?? 0,
    totalHadiths: (row.total_hadiths as number) ?? 0,
    course: (row.course as any) || 'المساق الحر',
    lastRecitation: row.last_recitation as string | null,
    lastDate: row.last_date ? new Date(row.last_date as string) : null,
    createdAt: new Date((row.created_at as string) || Date.now()),
    updatedAt: new Date((row.updated_at as string) || Date.now()),
  };
}

export const studentsRepository = {
  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('total_points', { ascending: false });
      if (error) {
        console.warn('Supabase students error:', error.message);
        return [];
      }
      return (data || []).map(mapStudent);
    } catch (err) {
      console.warn('Students fetch error:', err);
      return [];
    }
  },

  async getById(id: number): Promise<Student | undefined> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return undefined;
      return mapStudent(data);
    } catch {
      return undefined;
    }
  },

  async getByTeacherId(teacherId: number): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('total_points', { ascending: false });
      if (error) {
        console.warn('Supabase students by teacher error:', error.message);
        return [];
      }
      return (data || []).map(mapStudent);
    } catch (err) {
      console.warn('Students by teacher fetch error:', err);
      return [];
    }
  },

  async getLeaderboard(teacherId?: number, course?: string): Promise<Student[]> {
    try {
      let query = supabase
        .from('students')
        .select('*')
        .order('total_points', { ascending: false });
      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }
      if (course && course !== 'جميع المساقات (مشتركة)') {
        query = query.eq('course', course);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase leaderboard error:', error.message);
        return [];
      }
      return (data || []).map(mapStudent);
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
      return [];
    }
  },

  async add(student: Omit<Student, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name: student.name,
        teacher_id: student.teacherId,
        teacher_name: student.teacherName,
        course: student.course,
        total_points: student.totalPoints ?? 0,
        total_pages: student.totalPages ?? 0,
        total_hadiths: student.totalHadiths ?? 0,
        last_recitation: student.lastRecitation,
        last_date: student.lastDate?.toISOString() ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message || 'فشل إضافة الطالب في قاعدة البيانات');
    return data.id as number;
  },

  async update(id: number, changes: Partial<Student>): Promise<void> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (changes.name !== undefined) patch.name = changes.name;
    if (changes.teacherId !== undefined) patch.teacher_id = changes.teacherId;
    if (changes.teacherName !== undefined) patch.teacher_name = changes.teacherName;
    if (changes.course !== undefined) patch.course = changes.course;
    if (changes.totalPoints !== undefined) patch.total_points = changes.totalPoints;
    if (changes.totalPages !== undefined) patch.total_pages = changes.totalPages;
    if (changes.totalHadiths !== undefined) patch.total_hadiths = changes.totalHadiths;
    if (changes.lastRecitation !== undefined) patch.last_recitation = changes.lastRecitation;
    if (changes.lastDate !== undefined) patch.last_date = changes.lastDate?.toISOString() ?? null;

    const { error } = await supabase
      .from('students')
      .update(patch)
      .eq('id', id);
    if (error) throw new Error(error.message || 'فشل تعديل بيانات الطالب');
  },

  async transferToTeacher(studentId: number, teacherId: number, teacherName: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({
        teacher_id: teacherId,
        teacher_name: teacherName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);
    if (error) throw new Error(error.message || 'فشل نقل الطالب');
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message || 'فشل حذف الطالب');
  },

  async count(teacherId?: number): Promise<number> {
    try {
      let query = supabase.from('students').select('*', { count: 'exact', head: true });
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { count, error } = await query;
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  async addPointsAndPages(studentId: number, points: number, pages: number, hadiths: number = 0, surahName?: string, date?: Date): Promise<void> {
    const { data: current } = await supabase
      .from('students')
      .select('total_points, total_pages, total_hadiths')
      .eq('id', studentId)
      .single();
    const newTotalPoints = ((current?.total_points as number) ?? 0) + points;
    const newTotalPages = ((current?.total_pages as number) ?? 0) + pages;
    const newTotalHadiths = ((current?.total_hadiths as number) ?? 0) + hadiths;

    const patch: Record<string, unknown> = {
      total_points: newTotalPoints,
      total_pages: newTotalPages,
      total_hadiths: newTotalHadiths,
      updated_at: new Date().toISOString(),
    };
    if (surahName) patch.last_recitation = surahName;
    if (date) patch.last_date = date.toISOString();

    const { error } = await supabase
      .from('students')
      .update(patch)
      .eq('id', studentId);
    if (error) throw new Error(error.message || 'فشل تحديث بيانات الطالب');
  },
};
