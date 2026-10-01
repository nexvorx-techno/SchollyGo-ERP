const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  try {
    await db.exec('ALTER TABLE master_subjects ADD COLUMN book_name TEXT;');
    console.log('Added book_name');
  } catch(e) { console.log(e.message) }
  
  try {
    await db.exec('ALTER TABLE master_subjects ADD COLUMN total_chapters TEXT;');
    console.log('Added total_chapters');
  } catch(e) { console.log(e.message) }
  
  try {
    await db.exec('ALTER TABLE master_subjects ADD COLUMN cw_pages TEXT;');
    console.log('Added cw_pages');
  } catch(e) { console.log(e.message) }
  
  console.log('Done');
}

run();
