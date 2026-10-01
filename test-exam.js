const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  // Insert an exam
  const result = await db.run(
    'INSERT INTO exams (term_name, class_name, section_name) VALUES (?, ?, ?)',
    ['Mid Term', 'Class 1', 'A']
  );
  
  const examId = result.lastID;
  
  // Insert schedules
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await db.run(
    'INSERT INTO exam_schedules (exam_id, subject_name, exam_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
    [examId, 'Maths', yesterday.toISOString().split('T')[0], '09:00', '11:00']
  );
  
  await db.run(
    'INSERT INTO exam_schedules (exam_id, subject_name, exam_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
    [examId, 'English', tomorrow.toISOString().split('T')[0], '09:00', '11:00']
  );
  
  const exams = await db.all(`
    SELECT e.*, 
      (SELECT MIN(exam_date) FROM exam_schedules WHERE exam_id = e.id) as first_exam_date,
      (SELECT MAX(exam_date) FROM exam_schedules WHERE exam_id = e.id) as last_exam_date
    FROM exams e
  `);
  
  console.log(exams);
}
run();
