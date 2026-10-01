import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let pool = null;

export async function getDb() {
  if (pool) {
    return pool;
  }

  const dbUrl = process.env.DATABASE_URL;

  // Fallback to SQLite if no Cloud DB is configured
  if (!dbUrl || dbUrl.includes('localhost:3306/srms')) {
    console.log('No Cloud DATABASE_URL provided. Falling back to local SQLite database.');
    let dbPath = path.join(process.cwd(), 'srms.db');
    if (process.env.APPDATA_PATH) {
      dbPath = path.join(process.env.APPDATA_PATH, 'srms.db');
      const fs = require('fs');
      if (!fs.existsSync(dbPath)) {
        console.log('First run in production: copying initial database to APPDATA...');
        const initialDbPath = path.join(process.cwd(), 'srms.db');
        if (fs.existsSync(initialDbPath)) {
          fs.copyFileSync(initialDbPath, dbPath);
        }
      }
    }
      
    const sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    pool = {
      all: (sql, params) => sqliteDb.all(sql, params),
      get: (sql, params) => sqliteDb.get(sql, params),
      run: (sql, params) => sqliteDb.run(sql, params),
      _pool: sqliteDb
    };
    return pool;
  }

  console.log('Connecting to Cloud MySQL Database...');
  const mysqlPool = mysql.createPool(dbUrl);

  pool = {
    all: async (sql, params = []) => {
      try {
        const [rows] = await mysqlPool.execute(sql, params);
        return rows;
      } catch (err) {
        console.error('Database Error (all):', err);
        return [];
      }
    },
    get: async (sql, params = []) => {
      try {
        const [rows] = await mysqlPool.execute(sql, params);
        return rows.length > 0 ? rows[0] : null;
      } catch (err) {
        console.error('Database Error (get):', err);
        return null;
      }
    },
    run: async (sql, params = []) => {
      try {
        const [result] = await mysqlPool.execute(sql, params);
        return { lastID: result.insertId, changes: result.affectedRows };
      } catch (err) {
        console.error('Database Error (run):', err);
        return { lastID: 0, changes: 0 };
      }
    },
    _pool: mysqlPool
  };

  return pool;
}
