const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  try {
    await db.exec('ALTER TABLE master_classes ADD COLUMN start_time TEXT;');
    console.log('Added start_time');
  } catch(e) { console.log(e.message) }
  
  try {
    await db.exec('ALTER TABLE master_classes ADD COLUMN end_time TEXT;');
    console.log('Added end_time');
  } catch(e) { console.log(e.message) }
  
  console.log('Done');
}

run();
