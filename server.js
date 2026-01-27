import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Helper to read DB
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    return { clients: [], orders: [], leads: [] };
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { clients: [], orders: [], leads: [] };
  }
};

// Helper to write DB
const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/db', (req, res) => {
  res.json(readDb());
});

app.post('/api/db', (req, res) => {
  const newData = req.body;
  writeDb(newData);
  res.json({ success: true, message: 'Saved successfully' });
});

app.listen(PORT, () => {
  console.log(`SERVER: Backend running on http://localhost:${PORT}`);
  console.log(`SERVER: Persistence file is ${DB_FILE}`);
});
