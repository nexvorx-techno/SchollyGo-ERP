const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function createUsersTable() {
  const db = await open({
    filename: 'srms.db',
    driver: sqlite3.Database
  });

  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff (id)
      )
    `);
    
    console.log("Successfully created the users table.");
  } catch (error) {
    console.error("Error creating users table:", error);
  } finally {
    await db.close();
  }
}

createUsersTable();
