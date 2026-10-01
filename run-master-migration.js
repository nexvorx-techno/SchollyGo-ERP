const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'srms.db'));
const migration = fs.readFileSync(path.join(__dirname, 'master_migration.sql'), 'utf-8');

db.exec(migration, (err) => {
  if (err) {
    console.error('Migration failed:', err);
  } else {
    console.log('Migration successful.');
  }
  db.close();
});
