const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
  const db = await open({
    filename: path.join(__dirname, '../srms.db'),
    driver: sqlite3.Database
  });

  console.log('Connected to the srms.db database.');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE, -- e.g. SRMS/2026/001
      
      -- Personal Details
      name TEXT NOT NULL,
      father_name TEXT,
      mother_name TEXT,
      father_occupation TEXT,
      mother_occupation TEXT,
      present_address TEXT,
      permanent_address TEXT,
      father_mobile TEXT,
      father_email TEXT,
      mother_mobile TEXT,
      mother_email TEXT,
      whatsapp_number TEXT,
      whatsapp_number_owner TEXT,
      aadhar_number TEXT,
      dob DATE,
      place_of_birth TEXT,
      cast_category TEXT,
      
      -- Academic Details
      admission_number TEXT,
      class TEXT NOT NULL,
      roll_number INTEGER,
      class_teacher TEXT,
      last_school TEXT,
      student_house TEXT,
      class_coordinator TEXT,
      subjects TEXT,
      
      -- Fees Details
      tuition_fees REAL,
      bus_fees REAL,
      extra_class_fees REAL,
      other_fees REAL,
      
      -- Documents (Paths or flags)
      doc_aadhar TEXT,
      doc_photo TEXT,
      doc_sign TEXT,
      doc_tc TEXT,
      doc_father_aadhar TEXT,
      doc_mother_aadhar TEXT,
      doc_cast_certificate TEXT,
      
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      joining_date DATE,
      qualifications TEXT,
      contact TEXT,
      email TEXT,
      address TEXT,
      pan_number TEXT,
      bank_account TEXT,
      base_salary REAL,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER,
      date DATE NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      invoice_number TEXT UNIQUE,
      amount_due REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      description TEXT,
      due_date DATE,
      payment_date DATETIME,
      status TEXT DEFAULT 'Pending',
      payment_method TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      reference_id INTEGER,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('ERP Database tables created successfully.');
  await db.close();
}

initDb().catch((err) => {
  console.error(err.message);
});
