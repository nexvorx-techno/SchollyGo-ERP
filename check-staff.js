const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'srms.db'));

db.all("PRAGMA table_info(staff)", (err, rows) => {
  console.log(rows);
});
