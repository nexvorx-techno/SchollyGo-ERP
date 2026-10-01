'use server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createExam(examData) {
  const db = await getDb();
  
  const result = await db.run(
    'INSERT INTO exams (term_name, class_name, section_name) VALUES (?, ?, ?)',
    [examData.term_name, examData.class_name, examData.section_name]
  );
  
  const examId = result.lastID;
  
  for (const schedule of examData.schedules) {
    await db.run(
      'INSERT INTO exam_schedules (exam_id, subject_name, exam_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [examId, schedule.subject_name, schedule.exam_date, schedule.start_time, schedule.end_time]
    );
  }

  revalidatePath('/exams');
}

export async function updateExamStatus(id, newStatus) {
  const db = await getDb();
  await db.run('UPDATE exams SET status = ? WHERE id = ?', [newStatus, id]);
  revalidatePath('/exams');
}

export async function deleteExam(id) {
  const db = await getDb();
  await db.run('DELETE FROM exams WHERE id = ?', [id]);
  await db.run('DELETE FROM exam_schedules WHERE exam_id = ?', [id]);
  revalidatePath('/exams');
}

export async function getMappedSubjects(className) {
  const db = await getDb();
  const subjects = await db.all(`
    SELECT subject_name 
    FROM class_subject_mapping
    WHERE class_name = ?
  `, [className]);
  
  return subjects.map(s => s.subject_name);
}

export async function sendExamNotification(examId) {
  const db = await getDb();
  
  // 1. Get the exam details
  const exam = await db.get('SELECT * FROM exams WHERE id = ?', [examId]);
  if (!exam) return { success: false, message: 'Exam not found' };
  
  // 2. Query students in this class and section
  const students = await db.all(
    'SELECT name, parent_mobile FROM students WHERE class = ? AND section = ?',
    [exam.class_name, exam.section_name]
  );
  
  const validNumbers = students.filter(s => s.parent_mobile && s.parent_mobile.trim() !== '');
  
  // 3. Simulate sending WhatsApp messages
  // In a real scenario, we would loop through `validNumbers` and call the WhatsApp API
  console.log(`[WhatsApp Simulation] Sending ${exam.term_name} schedule to ${validNumbers.length} parents of ${exam.class_name} ${exam.section_name}.`);
  
  // Fake delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return { 
    success: true, 
    message: `WhatsApp notification successfully sent to ${validNumbers.length} parents.` 
  };
}
