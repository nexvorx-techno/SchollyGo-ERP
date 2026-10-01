CREATE TABLE master_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name TEXT NOT NULL UNIQUE,
    subject_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL UNIQUE,
    stream TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_subject_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    UNIQUE(class_name, subject_name)
);

CREATE TABLE class_section_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    UNIQUE(class_name, section_name)
);

CREATE TABLE class_teacher_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    staff_id INTEGER NOT NULL,
    FOREIGN KEY(staff_id) REFERENCES staff(id),
    UNIQUE(class_name, section_name)
);

CREATE TABLE subject_teacher_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    staff_id INTEGER NOT NULL,
    FOREIGN KEY(staff_id) REFERENCES staff(id),
    UNIQUE(class_name, section_name, subject_name)
);

-- Seed some default values to prevent breaking the UI immediately
INSERT OR IGNORE INTO master_classes (class_name) VALUES ('Nursery'), ('LKG'), ('UKG'), ('Class 1'), ('Class 2'), ('Class 3'), ('Class 4'), ('Class 5'), ('Class 6'), ('Class 7'), ('Class 8'), ('Class 9'), ('Class 10'), ('Class 11'), ('Class 12');
INSERT OR IGNORE INTO master_sections (section_name) VALUES ('A'), ('B'), ('C'), ('D');
