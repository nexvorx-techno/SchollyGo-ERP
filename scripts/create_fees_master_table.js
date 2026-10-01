const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const CLASSES = [
  'Nursery', 'LKG', 'UKG', 
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 
  'Class 5', 'Class 6', 'Class 7', 'Class 8', 
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

async function main() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  console.log('Creating class_fees_master table...');
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS class_fees_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT UNIQUE NOT NULL,
      tuition_fee REAL NOT NULL DEFAULT 0,
      bus_fee REAL NOT NULL DEFAULT 0,
      other_fee REAL NOT NULL DEFAULT 0
    )
  `);

  console.log('Seeding standard classes...');
  const stmt = await db.prepare(`
    INSERT OR IGNORE INTO class_fees_master (class_name, tuition_fee, bus_fee, other_fee)
    VALUES (?, 0, 0, 0)
  `);

  for (const c of CLASSES) {
    await stmt.run(c);
  }
  await stmt.finalize();

  console.log('class_fees_master table created and seeded successfully.');
}

main().catch(console.error);
