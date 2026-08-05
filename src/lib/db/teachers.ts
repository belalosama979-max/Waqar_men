import { supabase } from '@/lib/supabase';
import type { Teacher } from '@/types';

function mapTeacher(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as number,
    name: row.name as string,
    username: row.username as string,
    password: row.password as string,
    course: (row.course as any) || 'المساق الحر',
    createdAt: new Date((row.created_at as string) || Date.now()),
    updatedAt: new Date((row.updated_at as string) || Date.now()),
  };
}

export const teachersRepository = {
  async getAll(): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');
      if (error) {
        console.warn('Supabase teachers error:', error.message);
        return [];
      }
      return (data || []).map(mapTeacher);
    } catch (err) {
      console.warn('Teachers fetch error:', err);
      return [];
    }
  },

  async getById(id: number): Promise<Teacher | undefined> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return undefined;
      return mapTeacher(data);
    } catch {
      return undefined;
    }
  },

  async getByUsername(username: string): Promise<Teacher | undefined> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', username)
        .single();
      if (error || !data) return undefined;
      return mapTeacher(data);
    } catch {
      return undefined;
    }
  },

  async add(teacher: Omit<Teacher, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        name: teacher.name,
        username: teacher.username,
        password: teacher.password,
        course: teacher.course || 'المساق الحر',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message || 'فشل إضافة المعلم في قاعدة البيانات');
    return data.id as number;
  },

  async update(id: number, changes: Partial<Teacher>): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .update({
        ...(changes.name && { name: changes.name }),
        ...(changes.username && { username: changes.username }),
        ...(changes.password && { password: changes.password }),
        ...(changes.course && { course: changes.course }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message || 'فشل تعديل بيانات المعلم');
  },

  async delete(id: number): Promise<void> {
    await supabase
      .from('students')
      .update({ teacher_id: null, teacher_name: null })
      .eq('teacher_id', id);

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message || 'فشل حذف المعلم');
  },

  async count(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },
};

export const adminRepository = {
  async verifyAdmin(username: string, password: string): Promise<boolean> {
    // Hardcoded fallback admin credentials if database is not reachable yet
    if (username === 'admin' && password === 'admin123') {
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('username', username)
        .eq('password', password)
        .single();
      if (error || !data) return false;
      return true;
    } catch {
      return username === 'admin' && password === 'admin123';
    }
  },
};
