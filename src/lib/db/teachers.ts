import { supabase } from '@/lib/supabase';
import type { Teacher } from '@/types';

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapTeacher(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as number,
    name: row.name as string,
    username: row.username as string,
    password: row.password as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

export const teachersRepository = {
  async getAll(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data || []).map(mapTeacher);
  },

  async getById(id: number): Promise<Teacher | undefined> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return mapTeacher(data);
  },

  async getByUsername(username: string): Promise<Teacher | undefined> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('username', username)
      .single();
    if (error) return undefined;
    return mapTeacher(data);
  },

  async add(teacher: Omit<Teacher, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        name: teacher.name,
        username: teacher.username,
        password: teacher.password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id as number;
  },

  async update(id: number, changes: Partial<Teacher>): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .update({
        ...(changes.name && { name: changes.name }),
        ...(changes.username && { username: changes.username }),
        ...(changes.password && { password: changes.password }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: number): Promise<void> {
    // Detach students first
    await supabase
      .from('students')
      .update({ teacher_id: null, teacher_name: null })
      .eq('teacher_id', id);

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count ?? 0;
  },
};

// ─── Admin Auth ─────────────────────────────────────────────────────────────

export const adminRepository = {
  async verifyAdmin(username: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username)
      .eq('password', password)
      .single();
    if (error) return false;
    return !!data;
  },
};
