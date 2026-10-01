CREATE TABLE students (
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
      section TEXT,
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
    , fee_duration_type TEXT DEFAULT 'Monthly', blood_group TEXT, sibling_id INTEGER);

CREATE TABLE staff (
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
    , aadhar_number TEXT, uan_number TEXT, pf_number TEXT, father_name TEXT, mother_name TEXT, blood_group TEXT, dob DATE, ifsc_code TEXT, present_address TEXT, permanent_address TEXT, doc_photo TEXT, doc_sign TEXT, basic_pay REAL DEFAULT 0, hra REAL DEFAULT 0, other_allowances REAL DEFAULT 0, pf_deduction REAL DEFAULT 0, esi_deduction REAL DEFAULT 0);

CREATE TABLE attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER,
      date DATE NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );

CREATE TABLE fees (
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
    );

CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      reference_id INTEGER,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE fees_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      duration_type TEXT NOT NULL,
      months_paid TEXT NOT NULL,
      tuition_amount REAL NOT NULL,
      bus_amount REAL NOT NULL,
      other_amount REAL NOT NULL,
      late_fee_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_mode TEXT DEFAULT 'Cash',
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

CREATE TABLE class_fees_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT UNIQUE NOT NULL,
      tuition_fee REAL NOT NULL DEFAULT 0,
      bus_fee REAL NOT NULL DEFAULT 0,
      admission_fee REAL NOT NULL DEFAULT 0,
      caution_money REAL NOT NULL DEFAULT 0,
      other_fee REAL NOT NULL DEFAULT 0,
      late_fee_type TEXT DEFAULT 'None',
      late_fee_amount REAL NOT NULL DEFAULT 0,
    due_date_day INTEGER DEFAULT 10,
      duration_type TEXT DEFAULT 'Monthly');

CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        permissions TEXT,
        assigned_classes TEXT,
        approval_required INTEGER DEFAULT 0,
        reporting_to INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff (id),
        FOREIGN KEY (reporting_to) REFERENCES users (id)
      );

CREATE TABLE student_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    term TEXT,
    start_date DATE,
    end_date DATE,
    academic_year TEXT
);

CREATE TABLE exam_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

CREATE TABLE exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    student_id INTEGER,
    subject TEXT NOT NULL,
    marks_obtained REAL,
    max_marks REAL,
    remarks TEXT,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    period_number INTEGER NOT NULL,
    subject TEXT NOT NULL,
    teacher_id INTEGER,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY (teacher_id) REFERENCES staff(id)
);

CREATE TABLE homework (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    subject TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    description TEXT
);

CREATE TABLE qna (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    question TEXT NOT NULL,
    answer TEXT,
    date_posted DATETIME DEFAULT CURRENT_TIMESTAMP
);