const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function alterDb() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  console.log('Connected to the srms.db database.');

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

  await addColumn('staff', 'aadhar_number', 'TEXT');
  await addColumn('staff', 'uan_number', 'TEXT');
  await addColumn('staff', 'pf_number', 'TEXT');
  await addColumn('staff', 'father_name', 'TEXT');
  await addColumn('staff', 'mother_name', 'TEXT');
  await addColumn('staff', 'blood_group', 'TEXT');
  await addColumn('staff', 'dob', 'DATE');
  await addColumn('staff', 'ifsc_code', 'TEXT');

  console.log('Staff table altered successfully.');
  await db.close();
}

alterDb().catch((err) => {
  console.error(err.message);
});
