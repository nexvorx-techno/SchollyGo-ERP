const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('srms.db');

db.serialize(() => {
  db.run("DELETE FROM students");
  db.run("DELETE FROM staff");
  db.run("DELETE FROM users");
  db.run("DELETE FROM fees_entries");
  
  // Optional: Reset auto-increment counters if needed
  db.run("DELETE FROM sqlite_sequence");
  
  console.log("All data erased successfully. Tables remain intact.");
});
