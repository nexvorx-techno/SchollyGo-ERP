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

  await addColumn('staff', 'present_address', 'TEXT');
  await addColumn('staff', 'permanent_address', 'TEXT');
  await addColumn('staff', 'doc_photo', 'TEXT');
  await addColumn('staff', 'doc_sign', 'TEXT');

  console.log('Staff table altered for address and media.');
  await db.close();
}

alterDb().catch((err) => {
  console.error(err.message);
});
