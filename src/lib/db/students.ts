import { supabase } from '@/lib/supabase';
import type { Student } from '@/types';

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapStudent(row: Record<string, unknown>): Student {
  return {
    id: row.id as number,
    name: row.name as string,
    teacherId: row.teacher_id as number,
    teacherName: row.teacher_name as string | undefined,
    totalPoints: (row.total_points as number) ?? 0,
    lastRecitation: row.last_recitation as string | null,
    lastDate: row.last_date ? new Date(row.last_date as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

export const studentsRepository = {
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('total_points', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapStudent);
  },

  async getById(id: number): Promise<Student | undefined> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return mapStudent(data);
  },

  async getByTeacherId(teacherId: number): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('total_points', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapStudent);
  },

  async getLeaderboard(teacherId?: number): Promise<Student[]> {
    let query = supabase
      .from('students')
      .select('*')
      .order('total_points', { ascending: false });
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapStudent);
  },

  async add(student: Omit<Student, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name: student.name,
        teacher_id: student.teacherId,
        teacher_name: student.teacherName,
        total_points: student.totalPoints ?? 0,
        last_recitation: student.lastRecitation,
        last_date: student.lastDate?.toISOString() ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id as number;
  },

  async update(id: number, changes: Partial<Student>): Promise<void> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (changes.name !== undefined) patch.name = changes.name;
    if (changes.teacherId !== undefined) patch.teacher_id = changes.teacherId;
    if (changes.teacherName !== undefined) patch.teacher_name = changes.teacherName;
    if (changes.totalPoints !== undefined) patch.total_points = changes.totalPoints;
    if (changes.lastRecitation !== undefined) patch.last_recitation = changes.lastRecitation;
    if (changes.lastDate !== undefined) patch.last_date = changes.lastDate?.toISOString() ?? null;

    const { error } = await supabase
      .from('students')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
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
    if (error) throw error;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async count(teacherId?: number): Promise<number> {
    let query = supabase.from('students').select('*', { count: 'exact', head: true });
    if (teacherId) query = query.eq('teacher_id', teacherId);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  },

  async addPoints(studentId: number, points: number, surahName: string, date: Date): Promise<void> {
    // Fetch current total first
    const { data: current } = await supabase
      .from('students')
      .select('total_points')
      .eq('id', studentId)
      .single();
    const newTotal = ((current?.total_points as number) ?? 0) + points;

    const { error } = await supabase
      .from('students')
      .update({
        total_points: newTotal,
        last_recitation: surahName,
        last_date: date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);
    if (error) throw error;
  },
};
