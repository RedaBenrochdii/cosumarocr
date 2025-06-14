import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== AUTH ==========
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'reda@2025') {
    return res.status(200).json({ success: true, token: 'token123' });
  } else {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }
});

// ========== EMPLOYÉS ==========
app.get('/api/employes', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'employes.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const employes = JSON.parse(data);
    res.json(employes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture du fichier JSON' });
  }
});

// ========== UPLOAD DOCUMENT ==========
const DATA_FILE = path.join(__dirname, 'documents.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const data = {
      filename: req.file.filename,
      commentaire: req.body.commentaire,
      date: new Date().toISOString()
    };

    const fileData = fs.existsSync(DATA_FILE) ? await fs.readJson(DATA_FILE) : [];
    fileData.push(data);
    await fs.writeJson(DATA_FILE, fileData, { spaces: 2 });

    res.status(200).json({ success: true, message: 'Document reçu' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, error: 'Erreur interne' });
  }
});

// ========== GET DOCUMENTS ==========
app.get('/documents', async (_, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    res.json(data);
  } catch {
    res.json([]);
  }
});

// ========== HOME ==========
app.get('/', (req, res) => {
  res.send('✅ Backend fusionné opérationnel');
});

app.listen(PORT, () => {
  console.log(`✅ Serveur backend fusionné prêt sur http://localhost:${PORT}`);
});
