import { db } from './schema';
import type { Student } from '@/types';

export const studentsRepository = {
  async getAll(): Promise<Student[]> {
    return db.students.toArray();
  },

  async getById(id: number): Promise<Student | undefined> {
    return db.students.get(id);
  },

  async getByTeacherId(teacherId: number): Promise<Student[]> {
    return db.students.where('teacherId').equals(teacherId).toArray();
  },

  async add(data: Omit<Student, 'id'>): Promise<number> {
    return db.students.add(data) as Promise<number>;
  },

  async update(id: number, data: Partial<Student>): Promise<void> {
    await db.students.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: number): Promise<void> {
    await db.recitations.where('studentId').equals(id).delete();
    await db.students.delete(id);
  },

  async transferToTeacher(studentId: number, newTeacherId: number, newTeacherName: string): Promise<void> {
    await db.students.update(studentId, {
      teacherId: newTeacherId,
      teacherName: newTeacherName,
      updatedAt: new Date(),
    });
  },

  async updatePoints(studentId: number, pointsDelta: number, lastRecitation: string, lastDate: Date): Promise<void> {
    const student = await db.students.get(studentId);
    if (!student) return;
    await db.students.update(studentId, {
      totalPoints: (student.totalPoints || 0) + pointsDelta,
      lastRecitation,
      lastDate,
      updatedAt: new Date(),
    });
  },

  async getLeaderboard(teacherId?: number): Promise<Student[]> {
    let collection = teacherId
      ? db.students.where('teacherId').equals(teacherId)
      : db.students.toCollection();
    const students = await collection.toArray();
    return students.sort((a, b) => b.totalPoints - a.totalPoints);
  },

  async count(teacherId?: number): Promise<number> {
    if (teacherId) {
      return db.students.where('teacherId').equals(teacherId).count();
    }
    return db.students.count();
  },

  async search(query: string, teacherId?: number): Promise<Student[]> {
    const all = teacherId
      ? await db.students.where('teacherId').equals(teacherId).toArray()
      : await db.students.toArray();
    const lower = query.toLowerCase();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        (s.teacherName || '').toLowerCase().includes(lower)
    );
  },
};
