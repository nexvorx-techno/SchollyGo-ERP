const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  const tables = await db.all("SELECT sql FROM sqlite_master WHERE name='class_subject_mapping';");
  console.log(JSON.stringify(tables, null, 2));
}
run();
