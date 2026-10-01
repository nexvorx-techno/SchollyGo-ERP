const sqlite3 = require('sqlite3');
const fs = require('fs');

const db = new sqlite3.Database('srms.db');
const schema = fs.readFileSync('schema.sql', 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
  } else {
    console.log('Database initialized successfully from schema.sql');
  }
});
