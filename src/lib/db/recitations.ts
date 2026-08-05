import { supabase } from '@/lib/supabase';
import type { Recitation } from '@/types';

function mapRecitation(row: Record<string, unknown>): Recitation {
  return {
    id: row.id as number,
    studentId: row.student_id as number,
    studentName: row.student_name as string | undefined,
    teacherId: (row.teacher_id as number) ?? 0,
    teacherName: row.teacher_name as string | undefined,
    course: (row.course as any) || 'المساق الحر',
    date: new Date((row.date as string) || Date.now()),
    type: row.type as any,
    part: row.part as number | undefined,
    surah: row.surah as number | undefined,
    surahName: row.surah_name as string | undefined,
    fromPage: row.from_page as number | undefined,
    toPage: row.to_page as number | undefined,
    fromAyah: row.from_ayah as number | undefined,
    toAyah: row.to_ayah as number | undefined,
    pagesCount: (row.pages_count as number) ?? 0,
    hadithsCount: (row.hadiths_count as number) ?? 0,
    hadithsDetails: row.hadiths_details as string | undefined,
    isAdditional: (row.is_additional as boolean) ?? false,
    evaluation: row.evaluation as Recitation['evaluation'],
    evalPoints: (row.eval_points as number) ?? 0,
    extraPoints: (row.extra_points as number) ?? 0,
    totalPoints: (row.total_points as number) ?? 0,
    notes: row.notes as string | undefined,
    createdAt: new Date((row.created_at as string) || Date.now()),
  };
}

export const recitationsRepository = {
  async getAll(): Promise<Recitation[]> {
    try {
      const { data, error } = await supabase.from('recitations').select('*').order('date', { ascending: false });
      if (error) return [];
      return (data || []).map(mapRecitation);
    } catch {
      return [];
    }
  },

  async getByStudentId(studentId: number): Promise<Recitation[]> {
    try {
      const { data, error } = await supabase.from('recitations').select('*').eq('student_id', studentId).order('date', { ascending: false });
      if (error) return [];
      return (data || []).map(mapRecitation);
    } catch {
      return [];
    }
  },

  async add(rec: Omit<Recitation, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('recitations')
      .insert({
        student_id: rec.studentId,
        student_name: rec.studentName,
        teacher_id: rec.teacherId,
        teacher_name: rec.teacherName,
        course: rec.course,
        date: rec.date.toISOString(),
        type: rec.type,
        part: rec.part,
        surah: rec.surah,
        surah_name: rec.surahName,
        from_page: rec.fromPage,
        to_page: rec.toPage,
        from_ayah: rec.fromAyah,
        to_ayah: rec.toAyah,
        pages_count: rec.pagesCount,
        hadiths_count: rec.hadithsCount,
        hadiths_details: rec.hadithsDetails,
        is_additional: rec.isAdditional,
        evaluation: rec.evaluation,
        eval_points: rec.evalPoints,
        extra_points: rec.extraPoints,
        total_points: rec.totalPoints,
        notes: rec.notes,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message || 'فشل تسجيل التسميع');
    return data.id as number;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('recitations').delete().eq('id', id);
    if (error) throw new Error(error.message || 'فشل حذف التسميع');
  },

  async deleteByStudent(studentId: number): Promise<void> {
    try {
      await supabase.from('recitations').delete().eq('student_id', studentId);
    } catch (err) {
      console.warn('Delete recitations error:', err);
    }
  },

  async getEvaluationStats(studentId: number): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.from('recitations').select('evaluation').eq('student_id', studentId);
      if (error || !data) return {};
      return data.reduce((acc: Record<string, number>, curr) => {
        const ev = curr.evaluation as string;
        acc[ev] = (acc[ev] || 0) + 1;
        return acc;
      }, {});
    } catch {
      return {};
    }
  },

  async getChartData(studentId: number): Promise<{ date: string; points: number }[]> {
    try {
      const { data, error } = await supabase.from('recitations').select('date, total_points').eq('student_id', studentId).order('date', { ascending: true });
      if (error || !data) return [];
      
      let cumulative = 0;
      return data.map(r => {
        cumulative += (r.total_points as number) ?? 0;
        return {
          date: new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(new Date(r.date as string)),
          points: cumulative,
        };
      });
    } catch {
      return [];
    }
  },

  async getTodayCount(teacherId?: number): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', today.toISOString());
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { count, error } = await query;
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  async getWeekCount(teacherId?: number): Promise<number> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', weekAgo.toISOString());
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { count, error } = await query;
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  async getMonthCount(teacherId?: number): Promise<number> {
    try {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', monthAgo.toISOString());
      if (teacherId) query = query.eq('teacher_id', teacherId);
      const { count, error } = await query;
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  async getRecent(limit: number): Promise<Recitation[]> {
    try {
      const { data, error } = await supabase.from('recitations').select('*').order('date', { ascending: false }).limit(limit);
      if (error || !data) return [];
      return data.map(mapRecitation);
    } catch {
      return [];
    }
  },
};
