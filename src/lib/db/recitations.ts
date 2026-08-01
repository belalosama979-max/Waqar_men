import { db } from './schema';
import { studentsRepository } from './students';
import type { Recitation } from '@/types';

export const recitationsRepository = {
  async getAll(): Promise<Recitation[]> {
    return db.recitations.orderBy('date').reverse().toArray();
  },

  async getById(id: number): Promise<Recitation | undefined> {
    return db.recitations.get(id);
  },

  async getByStudentId(studentId: number): Promise<Recitation[]> {
    return db.recitations
      .where('studentId')
      .equals(studentId)
      .reverse()
      .sortBy('date');
  },

  async getByTeacherId(teacherId: number): Promise<Recitation[]> {
    return db.recitations
      .where('teacherId')
      .equals(teacherId)
      .reverse()
      .sortBy('date');
  },

  async add(data: Omit<Recitation, 'id'>): Promise<number> {
    const id = await db.recitations.add(data) as number;
    // Update student's total points, last recitation and last date
    await studentsRepository.updatePoints(
      data.studentId,
      data.totalPoints,
      data.surahName || (data.part ? `الجزء ${data.part}` : ''),
      data.date
    );
    return id;
  },

  async delete(id: number): Promise<void> {
    const recitation = await db.recitations.get(id);
    if (!recitation) return;
    // Reverse the points update
    const student = await db.recitations
      .where('studentId')
      .equals(recitation.studentId)
      .toArray();
    await db.recitations.delete(id);
    // Recalculate total points
    const remaining = student.filter((r) => r.id !== id);
    const newTotal = remaining.reduce((sum, r) => sum + r.totalPoints, 0);
    const lastRec = remaining.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    await db.students.update(recitation.studentId, {
      totalPoints: newTotal,
      lastRecitation: lastRec
        ? lastRec.surahName || (lastRec.part ? `الجزء ${lastRec.part}` : '')
        : null,
      lastDate: lastRec ? lastRec.date : null,
      updatedAt: new Date(),
    });
  },

  async getTodayCount(teacherId?: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let collection = teacherId
      ? db.recitations.where('teacherId').equals(teacherId)
      : db.recitations.toCollection();

    const all = await collection.toArray();
    return all.filter((r) => {
      const d = new Date(r.date);
      return d >= today && d < tomorrow;
    }).length;
  },

  async getWeekCount(teacherId?: number): Promise<number> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let collection = teacherId
      ? db.recitations.where('teacherId').equals(teacherId)
      : db.recitations.toCollection();

    const all = await collection.toArray();
    return all.filter((r) => new Date(r.date) >= weekAgo).length;
  },

  async getMonthCount(teacherId?: number): Promise<number> {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    let collection = teacherId
      ? db.recitations.where('teacherId').equals(teacherId)
      : db.recitations.toCollection();

    const all = await collection.toArray();
    return all.filter((r) => new Date(r.date) >= monthAgo).length;
  },

  async getRecent(limit = 10, teacherId?: number): Promise<Recitation[]> {
    let all = teacherId
      ? await db.recitations.where('teacherId').equals(teacherId).toArray()
      : await db.recitations.toArray();
    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  async getEvaluationStats(
    studentId: number
  ): Promise<Record<string, number>> {
    const records = await db.recitations
      .where('studentId')
      .equals(studentId)
      .toArray();
    const stats: Record<string, number> = {};
    for (const r of records) {
      stats[r.evaluation] = (stats[r.evaluation] || 0) + 1;
    }
    return stats;
  },

  async getChartData(studentId: number): Promise<{ date: string; points: number }[]> {
    const records = await db.recitations
      .where('studentId')
      .equals(studentId)
      .toArray();
    return records
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString('ar-SA'),
        points: r.totalPoints,
      }));
  },
};
