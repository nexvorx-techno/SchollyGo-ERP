const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'srms.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('master_sections', 'class_sections', 'class_section_mapping');");
  console.log(JSON.stringify(tables, null, 2));
}
run();
