import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const photosDir = path.join(uploadsDir, 'photos');
const receiptsDir = path.join(uploadsDir, 'receipts');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

// Setup SQLite database
const db = new Database(path.join(__dirname, 'nisgs.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    matric_no TEXT UNIQUE NOT NULL,
    nickname TEXT,
    dob_day INTEGER NOT NULL,
    dob_month INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    interests TEXT,
    phone TEXT,
    dues_status TEXT DEFAULT 'paid',
    receipt_url TEXT,
    amount_paid REAL DEFAULT 2000,
    payment_method TEXT DEFAULT 'transfer',
    payment_reference TEXT,
    verified_by_admin INTEGER DEFAULT 1,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Set default settings
const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
setSetting.run('dues_amount', '2000');
setSetting.run('account_name', 'OKEFOLAHAN OLAMIDE ISRAEL');
setSetting.run('account_number', '2091426004');
setSetting.run('bank_name', 'KUDA MFB');
setSetting.run('department_name', 'Surveying and Geoinformatics');
setSetting.run('academic_session', '2026/2027 Session');
setSetting.run('admin_pin', '2030');

// Seed single comprehensive showcase record for demonstration
const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
if (studentCount === 0) {
  db.prepare(`
    INSERT INTO students (
      full_name, matric_no, nickname, dob_day, dob_month, photo_url, interests,
      dues_status, receipt_url, amount_paid, verified_by_admin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, 2000, 1)
  `).run(
    'Adegoke Oluwaseun Michael',
    '250405001',
    'Gbeff',
    24,
    10,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    'Remote sensing, UAV drone piloting, Python for GIS, football',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      cb(null, photosDir);
    } else if (file.fieldname === 'receipt') {
      cb(null, receiptsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes

// 1. Get settings
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settingsObj = {};
  rows.forEach(r => settingsObj[r.key] = r.value);
  res.json(settingsObj);
});

// 2. Get students who have paid
app.get('/api/students', (req, res) => {
  const students = db.prepare("SELECT * FROM students WHERE dues_status = 'paid' ORDER BY full_name ASC").all();
  res.json({
    students,
    total: students.length
  });
});

// 3. Register student with receipt upload
app.post('/api/students/submit', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'receipt', maxCount: 1 }
]), (req, res) => {
  try {
    const {
      full_name,
      matric_no,
      nickname,
      dob_day,
      dob_month,
      interests
    } = req.body;

    if (!full_name || !matric_no || !dob_day || !dob_month) {
      return res.status(400).json({ error: 'Full name, matric number, and birth day/month are required' });
    }

    const cleanMatric = matric_no.trim().toUpperCase();
    const cleanName = full_name.trim();

    // Check if matric exists
    const existing = db.prepare('SELECT * FROM students WHERE matric_no = ?').get(cleanMatric);

    let photoUrl = existing ? existing.photo_url : null;
    let receiptUrl = existing ? existing.receipt_url : null;

    if (req.files?.['photo']?.[0]) {
      photoUrl = `/uploads/photos/${req.files['photo'][0].filename}`;
    }

    if (req.files?.['receipt']?.[0]) {
      receiptUrl = `/uploads/receipts/${req.files['receipt'][0].filename}`;
    }

    if (!photoUrl && !existing) {
      return res.status(400).json({ error: 'A photograph of the student is required' });
    }

    if (!receiptUrl && !existing) {
      return res.status(400).json({ error: 'Payment receipt upload is required' });
    }

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE students SET
          full_name = ?,
          nickname = ?,
          dob_day = ?,
          dob_month = ?,
          photo_url = COALESCE(?, photo_url),
          interests = ?,
          dues_status = 'paid',
          receipt_url = COALESCE(?, receipt_url),
          amount_paid = 2000,
          verified_by_admin = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE matric_no = ?
      `);

      updateStmt.run(
        cleanName,
        nickname ? nickname.trim() : null,
        parseInt(dob_day),
        parseInt(dob_month),
        photoUrl,
        interests ? interests.trim() : null,
        receiptUrl,
        cleanMatric
      );

      return res.json({ success: true, message: 'Details updated successfully! You are on the paid list.', matric_no: cleanMatric });
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO students (
          full_name, matric_no, nickname, dob_day, dob_month,
          photo_url, interests, dues_status, receipt_url,
          amount_paid, verified_by_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, 2000, 1)
      `);

      insertStmt.run(
        cleanName,
        cleanMatric,
        nickname ? nickname.trim() : null,
        parseInt(dob_day),
        parseInt(dob_month),
        photoUrl,
        interests ? interests.trim() : null,
        receiptUrl
      );

      return res.json({ success: true, message: 'Submitted successfully! You are now listed on the paid dashboard.', matric_no: cleanMatric });
    }
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ error: err.message || 'Failed to save submission' });
  }
});

// Admin PIN check
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const currentPin = db.prepare("SELECT value FROM settings WHERE key = 'admin_pin'").get()?.value || '2030';
  if (pin === currentPin) {
    return res.json({ success: true });
  }
  return res.status(403).json({ error: 'Incorrect Admin PIN' });
});

// Admin: Delete a student record if needed
app.post('/api/admin/delete-student', (req, res) => {
  const { pin, student_id } = req.body;
  const currentPin = db.prepare("SELECT value FROM settings WHERE key = 'admin_pin'").get()?.value || '2030';
  if (pin !== currentPin) {
    return res.status(403).json({ error: 'Incorrect Admin PIN' });
  }

  db.prepare('DELETE FROM students WHERE id = ?').run(student_id);
  res.json({ success: true, message: 'Student record removed' });
});

// Serve frontend for any other routes (SPA fallback)
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Class of 2030 Portal API Running.');
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` CLASS OF 2030 DUES & BIRTHDAY PORTAL`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
