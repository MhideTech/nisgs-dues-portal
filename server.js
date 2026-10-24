import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env.local if present
dotenv.config({ path: '.env.local' });
dotenv.config();

import app from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'dist')));

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
  console.log(` Connected to Neon Serverless PostgreSQL`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
