const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function main() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  try {
    await db.exec(`ALTER TABLE class_fees_master ADD COLUMN duration_type TEXT DEFAULT 'Monthly'`);
    console.log('Column added to class_fees_master');
  } catch (err) {
    console.log(err.message);
  }

  try {
    await db.exec(`ALTER TABLE students ADD COLUMN fee_duration_type TEXT DEFAULT 'Monthly'`);
    console.log('Column added to students');
  } catch (err) {
    console.log(err.message);
  }
}

main().catch(console.error);
