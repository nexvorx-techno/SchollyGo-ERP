const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'srms.db');
const migrationPath = path.join(__dirname, 'migration3.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
});

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

db.exec(migrationSql, (err) => {
  if (err) {
    console.error('Error executing migration', err);
    process.exit(1);
  }
  console.log('Migration executed successfully');
  db.close();
});
