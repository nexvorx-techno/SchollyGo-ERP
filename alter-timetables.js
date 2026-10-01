const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  try {
    // Create timetable_settings table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS timetable_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT NOT NULL,
        section_name TEXT NOT NULL,
        lunch_start_time TEXT,
        lunch_end_time TEXT,
        class_teacher_id INTEGER,
        UNIQUE(class_name, section_name)
      );
    `);
    
    // Check timetables table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class TEXT NOT NULL,
        section TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        subject TEXT NOT NULL,
        teacher_id INTEGER,
        start_time TEXT,
        end_time TEXT,
        FOREIGN KEY (teacher_id) REFERENCES staff(id)
      );
    `);
    
    console.log('Timetable tables verified/created successfully.');
  } catch(e) { 
    console.log(e.message) 
  }
}
run();
