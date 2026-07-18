-- ============================================
-- MediBook: Smart Hospital Management Platform
-- Complete SQL Schema
-- ============================================

-- Patients / Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient',  -- 'patient' or 'hospital_admin'
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals
CREATE TABLE hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    hospital_type VARCHAR(20) NOT NULL,  -- 'government' or 'private'
    has_emergency BOOLEAN DEFAULT 0,
    address VARCHAR(300),
    city VARCHAR(100),
    state VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    phone VARCHAR(20),
    description TEXT,
    rating FLOAT DEFAULT 4.0,
    image_url VARCHAR(500) DEFAULT '',
    working_hours VARCHAR(100) DEFAULT '09:00-17:00',
    parking BOOLEAN DEFAULT 0,
    icu BOOLEAN DEFAULT 0,
    ventilator INTEGER DEFAULT 0,
    total_beds INTEGER DEFAULT 0,
    waiting_time INTEGER DEFAULT 30,
    consultation_fee FLOAT DEFAULT 500,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_doctor_id INTEGER REFERENCES doctors(id)
);

-- Doctors
CREATE TABLE doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100),
    qualification VARCHAR(200),
    experience_years INTEGER DEFAULT 0,
    fee FLOAT DEFAULT 500.0,
    available_days VARCHAR(200) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    available_time VARCHAR(100) DEFAULT '09:00-17:00',
    image_url VARCHAR(500) DEFAULT '',
    languages VARCHAR(200) DEFAULT 'English',
    specialization VARCHAR(200),
    department_id INTEGER REFERENCES departments(id)
);

-- Time Slots
CREATE TABLE time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date VARCHAR(20) NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT 0
);

-- Appointments
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    slot_id INTEGER NOT NULL REFERENCES time_slots(id),
    status VARCHAR(20) DEFAULT 'booked',
    notes TEXT DEFAULT '',
    reason TEXT DEFAULT '',
    token_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medicines (DB-backed catalog)
CREATE TABLE medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(100),
    price FLOAT DEFAULT 0,
    stock INTEGER DEFAULT 0,
    expiry_date DATE,
    manufacturer VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    discount FLOAT DEFAULT 0,
    requires_prescription BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medicine Orders
CREATE TABLE medicine_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    items_json TEXT NOT NULL,
    total_price FLOAT DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'processing',
    tracking_id VARCHAR(50),
    address VARCHAR(300),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medical Reports
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL,  -- blood, xray, mri, ecg, urine, other
    file_url VARCHAR(500),
    file_name VARCHAR(200),
    ai_summary TEXT,
    findings TEXT,
    risk_level VARCHAR(20),
    recommendations TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Digital Prescriptions
CREATE TABLE prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    appointment_id INTEGER REFERENCES appointments(id),
    medicines_json TEXT,
    diagnosis TEXT,
    notes TEXT,
    pdf_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(30) NOT NULL,  -- appointment, reminder, medicine, emergency, order, report
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    last_restocked DATETIME,
    expiry_date DATE
);

-- Beds
CREATE TABLE beds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
    bed_type VARCHAR(50) NOT NULL,  -- ICU, General, Ventilator, Oxygen
    total INTEGER DEFAULT 0,
    available INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blood Bank
CREATE TABLE blood_bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER REFERENCES hospitals(id),
    blood_group VARCHAR(5) NOT NULL,
    units_available INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blood Requests
CREATE TABLE blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    blood_group VARCHAR(5) NOT NULL,
    units INTEGER DEFAULT 1,
    hospital_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ambulance Requests
CREATE TABLE ambulance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    location TEXT NOT NULL,
    phone VARCHAR(20),
    emergency_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'requested',
    estimated_arrival INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medicine Reminders
CREATE TABLE medicine_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    medicine_name VARCHAR(200) NOT NULL,
    dose VARCHAR(100),
    morning BOOLEAN DEFAULT 0,
    afternoon BOOLEAN DEFAULT 0,
    night BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lab Tests
CREATE TABLE lab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    test_type VARCHAR(50) NOT NULL,
    test_name VARCHAR(100),
    date VARCHAR(20),
    price FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'booked',
    result_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Feedback / Reviews
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(30) NOT NULL,  -- doctor, hospital, medicine, appointment
    target_name VARCHAR(200),
    target_id INTEGER,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Health Records
CREATE TABLE health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    record_type VARCHAR(50) NOT NULL,  -- weight, bp, sugar, heart_rate, bmi
    value FLOAT NOT NULL,
    unit VARCHAR(20),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Queue / Token Management
CREATE TABLE queue_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    token_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',  -- waiting, current, completed
    estimated_wait INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist
CREATE TABLE wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, medicine_id)
);

-- Settings
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    theme VARCHAR(10) DEFAULT 'light',
    language VARCHAR(5) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT 1
);

-- Purchase History (Inventory)
CREATE TABLE purchase_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    cost FLOAT DEFAULT 0,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
