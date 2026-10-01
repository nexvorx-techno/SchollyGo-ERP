'use server';

import { getDb } from '@/lib/db';

export async function getStudentsForAttendance(className, sectionName, date) {
  const db = await getDb();
  
  // Get all students for this class and section
  const students = await db.all(
    'SELECT id, student_id, name, roll_number FROM students WHERE class = ? AND section = ? AND status = "Active" ORDER BY roll_number ASC, name ASC',
    [className, sectionName]
  );

  // Check if attendance already exists for this date, class, section
  const existingAttendance = await db.all(
    'SELECT student_id, status, remarks FROM student_attendance WHERE class = ? AND section = ? AND date = ?',
    [className, sectionName, date]
  );

  const existingMap = {};
  existingAttendance.forEach(record => {
    existingMap[record.student_id] = record;
  });

  // Map to combine existing attendance with student list
  const combined = students.map(student => ({
    id: student.id,
    student_id: student.student_id,
    name: student.name,
    roll_number: student.roll_number,
    status: existingMap[student.id]?.status || 'Present', // Default to Present
    remarks: existingMap[student.id]?.remarks || ''
  }));

  return combined;
}

export async function saveAttendance(date, className, sectionName, attendanceData) {
  const db = await getDb();
  
  // Delete existing for this date/class/section to prevent duplicates
  await db.run(
    'DELETE FROM student_attendance WHERE date = ? AND class = ? AND section = ?',
    [date, className, sectionName]
  );

  // Prepare insert
  const stmt = await db.prepare(
    'INSERT INTO student_attendance (student_id, class, section, date, status, remarks) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const record of attendanceData) {
    await stmt.run(record.id, className, sectionName, date, record.status, record.remarks);
  }
  await stmt.finalize();

  return { success: true };
}
