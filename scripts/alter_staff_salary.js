const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function alterDb() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  const addColumn = async (table, column, type) => {
    try {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      console.log(`Added column ${column} to ${table}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`Column ${column} already exists in ${table}`);
      } else {
        console.error(`Error adding column ${column} to ${table}:`, e.message);
      }
    }
  };

  await addColumn('staff', 'basic_pay', 'REAL DEFAULT 0');
  await addColumn('staff', 'hra', 'REAL DEFAULT 0');
  await addColumn('staff', 'other_allowances', 'REAL DEFAULT 0');
  await addColumn('staff', 'pf_deduction', 'REAL DEFAULT 0');
  await addColumn('staff', 'esi_deduction', 'REAL DEFAULT 0');

  console.log('Staff table altered for salary components.');
  await db.close();
}

alterDb().catch((err) => {
  console.error(err.message);
});
