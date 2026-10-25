import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { neon } from '@neondatabase/serverless';

const app = express();

// Disable Express ETag to prevent 304 stale caching
app.set('etag', false);

app.use(cors());
// Support JSON bodies up to 10MB for fast compressed base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Never cache API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Multer memory storage for backward compatibility with multipart uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const DEFAULT_SETTINGS = {
  dues_amount: '2000',
  account_name: 'OKEFOLAHAN OLAMIDE ISRAEL',
  account_number: '2091426004',
  bank_name: 'KUDA MFB',
  department_name: 'Surveying and Geoinformatics',
  academic_session: '2026/2027 Session',
  admin_pin: '2030'
};

const getSql = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not configured');
  }
  return neon(dbUrl);
};

// 1. Get Settings
app.get('/api/settings', async (req, res) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT key, value FROM settings`;
    const settings = { ...DEFAULT_SETTINGS };
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('Settings error:', err.message);
    res.json(DEFAULT_SETTINGS);
  }
});

// 2. Get Students (from PostgreSQL)
app.get('/api/students', async (req, res) => {
  try {
    const sql = getSql();
    const students = await sql`
      SELECT * FROM students 
      WHERE dues_status = 'paid' 
      ORDER BY full_name ASC
    `;
    res.json({
      students,
      total: students.length
    });
  } catch (err) {
    console.error('Students fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch students from database' });
  }
});

// 3. Submit Student Details & Receipt (PostgreSQL Upsert)
app.post('/api/students/submit', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'receipt', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      full_name,
      matric_no,
      nickname,
      dob_day,
      dob_month,
      interests,
      photo: jsonPhoto,
      receipt: jsonReceipt
    } = req.body;

    if (!full_name || !matric_no || !dob_day || !dob_month) {
      return res.status(400).json({ error: 'Full name, matric number, and birth day/month are required' });
    }

    const cleanName = full_name.trim();
    const nameParts = cleanName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      return res.status(400).json({ error: 'Full name must contain at least two names separated by a space.' });
    }

    const cleanMatric = matric_no.trim();
    if (!/^\d{9}$/.test(cleanMatric)) {
      return res.status(400).json({ error: 'Matriculation number must be a number and exactly 9 digits.' });
    }

    const sql = getSql();

    // Check existing record
    const existingRows = await sql`
      SELECT id, full_name, photo_url, receipt_url, nickname, interests, created_at 
      FROM students 
      WHERE matric_no = ${cleanMatric} 
      LIMIT 1
    `;
    const existing = existingRows[0] || null;

    if (existing) {
      const existingNameClean = existing.full_name.trim().toLowerCase();
      const newNameClean = cleanName.trim().toLowerCase();
      if (existingNameClean !== newNameClean) {
        return res.status(400).json({
          error: `Matric number ${cleanMatric} is already registered to "${existing.full_name}". Each coursemate must submit with their own unique 9-digit matric number.`
        });
      }
    }

    let photoUrl = jsonPhoto || (existing ? existing.photo_url : null);
    let receiptUrl = jsonReceipt || (existing ? existing.receipt_url : null);

    // If uploaded via multipart files
    if (req.files?.['photo']?.[0]) {
      const f = req.files['photo'][0];
      photoUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
    }
    if (req.files?.['receipt']?.[0]) {
      const f = req.files['receipt'][0];
      receiptUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
    }

    if (!photoUrl && !existing) {
      return res.status(400).json({ error: 'A photograph of the student is required' });
    }
    if (!receiptUrl && !existing) {
      return res.status(400).json({ error: 'Payment receipt upload is required' });
    }

    const insertedRows = await sql`
      INSERT INTO students (
        full_name, matric_no, nickname, dob_day, dob_month,
        photo_url, interests, dues_status, receipt_url,
        amount_paid, verified_by_admin, updated_at
      ) VALUES (
        ${cleanName},
        ${cleanMatric},
        ${nickname ? nickname.trim() : (existing?.nickname || null)},
        ${parseInt(dob_day)},
        ${parseInt(dob_month)},
        ${photoUrl},
        ${interests ? interests.trim() : (existing?.interests || null)},
        'paid',
        ${receiptUrl},
        2000,
        1,
        NOW()
      )
      ON CONFLICT (matric_no) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        nickname = COALESCE(EXCLUDED.nickname, students.nickname),
        dob_day = EXCLUDED.dob_day,
        dob_month = EXCLUDED.dob_month,
        photo_url = COALESCE(EXCLUDED.photo_url, students.photo_url),
        interests = COALESCE(EXCLUDED.interests, students.interests),
        receipt_url = COALESCE(EXCLUDED.receipt_url, students.receipt_url),
        updated_at = NOW()
      RETURNING *;
    `;

    res.json({
      success: true,
      message: 'Submitted successfully! You are now listed on the paid dashboard.',
      student: insertedRows[0]
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to save submission' });
  }
});

// 4. Admin PIN check
app.post('/api/admin/verify-pin', async (req, res) => {
  const { pin } = req.body;
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM settings WHERE key = 'admin_pin' LIMIT 1`;
    const adminPin = rows[0]?.value || DEFAULT_SETTINGS.admin_pin;
    if (pin === adminPin) {
      return res.json({ success: true });
    }
    return res.status(403).json({ error: 'Incorrect Admin PIN' });
  } catch {
    if (pin === DEFAULT_SETTINGS.admin_pin) {
      return res.json({ success: true });
    }
    return res.status(403).json({ error: 'Incorrect Admin PIN' });
  }
});

// 5. Admin: Delete student
app.post('/api/admin/delete-student', async (req, res) => {
  const { pin, student_id } = req.body;
  if (pin !== DEFAULT_SETTINGS.admin_pin) {
    return res.status(403).json({ error: 'Incorrect Admin PIN' });
  }

  try {
    const sql = getSql();
    await sql`DELETE FROM students WHERE id = ${parseInt(student_id)}`;
    res.json({ success: true, message: 'Student record removed' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete student record' });
  }
});

export default app;
