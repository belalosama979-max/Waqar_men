import { supabase } from '@/lib/supabase';
import type { Recitation } from '@/types';

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapRecitation(row: Record<string, unknown>): Recitation {
  return {
    id: row.id as number,
    studentId: row.student_id as number,
    studentName: row.student_name as string | undefined,
    teacherId: (row.teacher_id as number) ?? 0,
    teacherName: row.teacher_name as string | undefined,
    date: new Date(row.date as string),
    type: row.type as 'جزء' | 'سورة',
    part: row.part as number | undefined,
    surah: row.surah as number | undefined,
    surahName: row.surah_name as string | undefined,
    evaluation: row.evaluation as any,
    evalPoints: row.eval_points as number,
    extraPoints: row.extra_points as number,
    totalPoints: row.total_points as number,
    notes: row.notes as string | undefined,
    createdAt: new Date(row.created_at as string),
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

export const recitationsRepository = {
  async getAll(): Promise<Recitation[]> {
    const { data, error } = await supabase.from('recitations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRecitation);
  },

  async getByStudentId(studentId: number): Promise<Recitation[]> {
    const { data, error } = await supabase.from('recitations').select('*').eq('student_id', studentId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRecitation);
  },

  async add(rec: Omit<Recitation, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('recitations')
      .insert({
        student_id: rec.studentId,
        student_name: rec.studentName,
        teacher_id: rec.teacherId,
        teacher_name: rec.teacherName,
        date: rec.date.toISOString(),
        type: rec.type,
        part: rec.part,
        surah: rec.surah,
        surah_name: rec.surahName,
        evaluation: rec.evaluation,
        eval_points: rec.evalPoints,
        extra_points: rec.extraPoints,
        total_points: rec.totalPoints,
        notes: rec.notes,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id as number;
  },

  async deleteByStudent(studentId: number): Promise<void> {
    const { error } = await supabase.from('recitations').delete().eq('student_id', studentId);
    if (error) throw error;
  },

  async getEvaluationStats(studentId: number): Promise<Record<string, number>> {
    const { data, error } = await supabase.from('recitations').select('evaluation').eq('student_id', studentId);
    if (error) return {};
    return (data || []).reduce((acc: Record<string, number>, curr) => {
      acc[curr.evaluation] = (acc[curr.evaluation] || 0) + 1;
      return acc;
    }, {});
  },

  async getChartData(studentId: number): Promise<{ date: string; points: number }[]> {
    const { data, error } = await supabase.from('recitations').select('date, total_points').eq('student_id', studentId).order('date', { ascending: true });
    if (error) return [];
    
    let cumulative = 0;
    return (data || []).map(r => {
      cumulative += (r.total_points as number);
      return {
        date: new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(new Date(r.date as string)),
        points: cumulative,
      };
    });
  },

  async getTodayCount(teacherId?: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', today.toISOString());
    if (teacherId) query = query.eq('teacher_id', teacherId);
    const { count } = await query;
    return count ?? 0;
  },

  async getWeekCount(teacherId?: number): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', weekAgo.toISOString());
    if (teacherId) query = query.eq('teacher_id', teacherId);
    const { count } = await query;
    return count ?? 0;
  },

  async getMonthCount(teacherId?: number): Promise<number> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    let query = supabase.from('recitations').select('*', { count: 'exact', head: true }).gte('date', monthAgo.toISOString());
    if (teacherId) query = query.eq('teacher_id', teacherId);
    const { count } = await query;
    return count ?? 0;
  },

  async getRecent(limit: number): Promise<Recitation[]> {
    const { data, error } = await supabase.from('recitations').select('*').order('date', { ascending: false }).limit(limit);
    if (error) return [];
    return (data || []).map(mapRecitation);
  },
};
