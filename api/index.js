import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { put, del, list, get } from '@vercel/blob';
import path from 'path';

const app = express();

// Disable Express ETag so responses are never cached as 304 Not Modified
app.set('etag', false);

app.use(cors());
app.use(express.json());

// Force no caching on all API responses so updates reflect immediately
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Memory storage for multer (serverless compatible)
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

const BLOB_PREFIX = 'data/students-';

// In-memory fallback if Blob is unreachable
let localStudents = [INITIAL_SHOWCASE_STUDENT];

// Read students from Blob or fallback
async function getStudentsList() {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length > 0) {
      // Sort descending by uploadedAt to get the latest snapshot
      blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      const latest = blobs[0];
      const res = await get(latest.pathname, { access: 'public' });
      if (res && res.stream) {
        const text = await new Response(res.stream).text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStudents = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Vercel Blob] Read note:', err.message);
  }
  return localStudents;
}

// Save students to Blob with unique snapshot to guarantee zero-cache staleness
async function saveStudentsList(students) {
  localStudents = students;
  try {
    const newPath = `${BLOB_PREFIX}${Date.now()}.json`;
    await put(newPath, JSON.stringify(students, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });
    console.log(`[Vercel Blob] Successfully saved snapshot with ${students.length} students to ${newPath}`);

    // Prune older snapshots
    list({ prefix: BLOB_PREFIX }).then(async ({ blobs }) => {
      for (const b of blobs) {
        if (b.pathname !== newPath) {
          await del(b.url).catch(() => {});
        }
      }
    }).catch(() => {});
  } catch (err) {
    console.error('[Vercel Blob] Write error:', err.message);
    throw err;
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

    // Upload photo to Blob or fallback to base64
    if (req.files?.['photo']?.[0]) {
      const file = req.files['photo'][0];
      try {
        const unique = `photos/${Date.now()}-${cleanMatric.replace(/[^A-Z0-9]/gi, '_')}${path.extname(file.originalname) || '.jpg'}`;
        const blob = await put(unique, file.buffer, {
          access: 'public',
          contentType: file.mimetype
        });
        photoUrl = blob.url;
      } catch (blobErr) {
        console.warn('Photo Blob upload fallback:', blobErr.message);
        photoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    // Upload receipt to Blob or fallback to base64
    if (req.files?.['receipt']?.[0]) {
      const file = req.files['receipt'][0];
      try {
        const unique = `receipts/${Date.now()}-${cleanMatric.replace(/[^A-Z0-9]/gi, '_')}${path.extname(file.originalname) || '.jpg'}`;
        const blob = await put(unique, file.buffer, {
          access: 'public',
          contentType: file.mimetype
        });
        receiptUrl = blob.url;
      } catch (blobErr) {
        console.warn('Receipt Blob upload fallback:', blobErr.message);
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
      matric_no: cleanMatric,
      student: studentRecord
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

  try {
    let students = await getStudentsList();
    students = students.filter(s => s.id !== student_id);
    await saveStudentsList(students);
    res.json({ success: true, message: 'Student record removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student record' });
  }
});

export default app;
