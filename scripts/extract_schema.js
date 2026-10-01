const sqlite3 = require('sqlite3');
const fs = require('fs');
const db = new sqlite3.Database('srms.db');

db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    const schema = rows.map(r => r.sql + ';').join('\n\n');
    fs.writeFileSync('schema.sql', schema);
    console.log('Schema extracted to schema.sql.');
  }
});
