const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function main() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  console.log('Creating fees_entries table...');
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS fees_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      duration_type TEXT NOT NULL,
      months_paid TEXT NOT NULL,
      tuition_amount REAL NOT NULL,
      bus_amount REAL NOT NULL,
      other_amount REAL NOT NULL,
      late_fee_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_mode TEXT DEFAULT 'Cash',
      FOREIGN KEY(student_id) REFERENCES students(id)
    )
  `);

  console.log('fees_entries table created successfully.');
}

main().catch(console.error);
