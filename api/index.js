import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { put, del, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Memory storage for multer (100% serverless compatible)
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

const INITIAL_SHOWCASE_STUDENT = {
  id: 1,
  full_name: 'Adegoke Oluwaseun Michael',
  matric_no: '250405001',
  nickname: 'Gbeff',
  dob_day: 24,
  dob_month: 10,
  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  interests: 'Remote sensing, UAV drone piloting, Python for GIS, football',
  dues_status: 'paid',
  receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  amount_paid: 2000,
  verified_by_admin: 1,
  created_at: new Date().toISOString()
};

// Blob options helper
function getBlobOptions() {
  const options = { access: 'public' };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    options.token = process.env.BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.BLOB_STORE_ID) {
    options.storeId = process.env.BLOB_STORE_ID;
  }
  if (process.env.VERCEL_OIDC_TOKEN) {
    options.oidcToken = process.env.VERCEL_OIDC_TOKEN;
  }
  return options;
}

// In-memory fallback for local dev if Blob is offline
let localStudents = [INITIAL_SHOWCASE_STUDENT];

// Read students from Blob or fallback
async function getStudentsList() {
  try {
    const blobOpts = getBlobOptions();
    if (blobOpts.token || (blobOpts.storeId && blobOpts.oidcToken)) {
      const { blobs } = await list({ prefix: 'data/students.json', ...blobOpts });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
      }
    }
  } catch (err) {
    console.warn('Vercel Blob read note:', err.message);
  }
  return localStudents;
}

// Save students to Blob or fallback
async function saveStudentsList(students) {
  localStudents = students;
  try {
    const blobOpts = getBlobOptions();
    if (blobOpts.token || (blobOpts.storeId && blobOpts.oidcToken)) {
      await put('data/students.json', JSON.stringify(students, null, 2), {
        ...blobOpts,
        addRandomSuffix: false,
        contentType: 'application/json'
      });
    }
  } catch (err) {
    console.warn('Vercel Blob write note:', err.message);
  }
}

// 1. Get settings
app.get('/api/settings', (req, res) => {
  res.json(DEFAULT_SETTINGS);
});

// 2. Get students
app.get('/api/students', async (req, res) => {
  try {
    const list = await getStudentsList();
    res.json({
      students: list,
      total: list.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 3. Submit student details with photo & receipt
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
      interests
    } = req.body;

    if (!full_name || !matric_no || !dob_day || !dob_month) {
      return res.status(400).json({ error: 'Full name, matric number, and birth day/month are required' });
    }

    const cleanMatric = matric_no.trim().toUpperCase();
    const cleanName = full_name.trim();

    let students = await getStudentsList();
    const existingIndex = students.findIndex(s => s.matric_no === cleanMatric);
    const existing = existingIndex >= 0 ? students[existingIndex] : null;

    let photoUrl = existing ? existing.photo_url : null;
    let receiptUrl = existing ? existing.receipt_url : null;

    const blobOpts = getBlobOptions();
    const isBlobActive = Boolean(blobOpts.token || (blobOpts.storeId && blobOpts.oidcToken));

    // Upload photo
    if (req.files?.['photo']?.[0]) {
      const file = req.files['photo'][0];
      if (isBlobActive) {
        const unique = `photos/${Date.now()}-${cleanMatric.replace(/[^A-Z0-9]/gi, '_')}${path.extname(file.originalname) || '.jpg'}`;
        const blob = await put(unique, file.buffer, {
          ...blobOpts,
          contentType: file.mimetype
        });
        photoUrl = blob.url;
      } else {
        // Fallback base64
        photoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    // Upload receipt
    if (req.files?.['receipt']?.[0]) {
      const file = req.files['receipt'][0];
      if (isBlobActive) {
        const unique = `receipts/${Date.now()}-${cleanMatric.replace(/[^A-Z0-9]/gi, '_')}${path.extname(file.originalname) || '.jpg'}`;
        const blob = await put(unique, file.buffer, {
          ...blobOpts,
          contentType: file.mimetype
        });
        receiptUrl = blob.url;
      } else {
        // Fallback base64
        receiptUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    if (!photoUrl && !existing) {
      return res.status(400).json({ error: 'A photograph of the student is required' });
    }
    if (!receiptUrl && !existing) {
      return res.status(400).json({ error: 'Payment receipt upload is required' });
    }

    const studentRecord = {
      id: existing ? existing.id : Date.now(),
      full_name: cleanName,
      matric_no: cleanMatric,
      nickname: nickname ? nickname.trim() : (existing?.nickname || null),
      dob_day: parseInt(dob_day),
      dob_month: parseInt(dob_month),
      photo_url: photoUrl,
      interests: interests ? interests.trim() : (existing?.interests || null),
      dues_status: 'paid',
      receipt_url: receiptUrl,
      amount_paid: 2000,
      verified_by_admin: 1,
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      students[existingIndex] = studentRecord;
    } else {
      students.push(studentRecord);
    }

    await saveStudentsList(students);

    res.json({
      success: true,
      message: 'Submitted successfully! You are now listed on the paid dashboard.',
      matric_no: cleanMatric
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to save submission' });
  }
});

// 4. Admin PIN check
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === DEFAULT_SETTINGS.admin_pin) {
    return res.json({ success: true });
  }
  return res.status(403).json({ error: 'Incorrect Admin PIN' });
});

// 5. Admin: Delete a student record
app.post('/api/admin/delete-student', async (req, res) => {
  const { pin, student_id } = req.body;
  if (pin !== DEFAULT_SETTINGS.admin_pin) {
    return res.status(403).json({ error: 'Incorrect Admin PIN' });
  }

  let students = await getStudentsList();
  students = students.filter(s => s.id !== student_id);
  await saveStudentsList(students);

  res.json({ success: true, message: 'Student record removed' });
});

export default app;
