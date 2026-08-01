import { db } from './schema';
import type { Teacher } from '@/types';

export const teachersRepository = {
  async getAll(): Promise<Teacher[]> {
    return db.teachers.toArray();
  },

  async getById(id: number): Promise<Teacher | undefined> {
    return db.teachers.get(id);
  },

  async add(data: Omit<Teacher, 'id'>): Promise<number> {
    return db.teachers.add(data) as Promise<number>;
  },

  async update(id: number, data: Partial<Teacher>): Promise<void> {
    await db.teachers.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: number): Promise<void> {
    // Move students to unassigned (teacherId = 0) before deletion
    await db.students.where('teacherId').equals(id).modify({ teacherId: 0, teacherName: 'غير محدد' });
    await db.teachers.delete(id);
  },

  async findByUsername(username: string): Promise<Teacher | undefined> {
    return db.teachers.where('username').equals(username).first();
  },

  async count(): Promise<number> {
    return db.teachers.count();
  },
};
