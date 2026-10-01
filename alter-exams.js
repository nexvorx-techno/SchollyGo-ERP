const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  try {
    await db.exec('DROP TABLE IF EXISTS exam_schedules;');
    await db.exec('DROP TABLE IF EXISTS exams;');
    
    await db.exec(`
      CREATE TABLE exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term_name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        section_name TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.exec(`
      CREATE TABLE exam_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        exam_date DATE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      );
    `);
    
    console.log('Exam tables recreated successfully.');
  } catch(e) { 
    console.log(e.message) 
  }
}
run();
