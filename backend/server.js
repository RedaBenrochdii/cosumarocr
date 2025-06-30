import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Clé Gemini manquante dans .env");
  process.exit(1);
}

import { poolPromise } from './config/db.js';

import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import uploadRoute from './routes/uploadRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

const EMPLOYES_FILE = path.join(__dirname, 'data', 'employes.json');
const DATA_FILE = path.join(__dirname, 'documents.json');
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

// 🔐 Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', uploadRoute);
app.use('/uploads', express.static(uploadDir));

// 🔐 Auth simple
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'cosum@2025') {
    res.status(200).json({ success: true, token: 'token123' });
  } else {
    res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }
});

// 👥 Gestion employés (fichier JSON)
/*app.get('/api/employes', (req, res) => {
  try {t
    const data = fs.readFileSync(EMPLOYES_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lecture employés' });
  }
});

app.post('/api/employes/update', (req, res) => {
  try {
    const backup = EMPLOYES_FILE.replace('.json', '.bak.json');
    if (fs.existsSync(EMPLOYES_FILE)) fs.copyFileSync(EMPLOYES_FILE, backup);
    fs.writeFileSync(EMPLOYES_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true, message: 'Employés mis à jour avec sauvegarde' });
  } catch (err) {
    console.error('❌ Erreur mise à jour :', err);
    res.status(500).json({ success: false, error: 'Échec sauvegarde' });
  }
});
*/
// 📥 Upload documents
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const doc = {
      filename: req.file.filename,
      commentaire: req.body.commentaire,
      date: new Date().toISOString()
    };
    const oldData = fs.existsSync(DATA_FILE) ? await fs.readJson(DATA_FILE) : [];
    oldData.push(doc);
    await fs.writeJson(DATA_FILE, oldData, { spaces: 2 });
    res.json({ success: true, message: 'Document reçu' });
  } catch (err) {
    console.error('❌ Erreur upload :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// 📂 Lister documents
app.get('/documents', async (_, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    res.json(data);
  } catch {
    res.json([]);
  }
});

// 🤖 OCR via Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/ocr/gemini', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const filePath = path.join(uploadDir, req.file.filename);
    const base64 = await fs.readFile(filePath, { encoding: 'base64' });
    const mimeType = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Voici un document de mutuelle. Extrais les champs suivants (s'il y en a) sous forme d'objet JSON :
- Matricule_Employe
- Nom_Employe
- Prenom_Employe
- Nom_Malade
- Prenom_Malade
- Type_Malade
- Montant
- Montant_Rembourse
- Code_Assurance
- Numero_Declaration
- DateConsultation

Formate la réponse uniquement en JSON.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64, mimeType } }
    ]);

    const text = result.response.text();
    console.log('🧠 Réponse Gemini :', text);

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(200).json({ error: "Réponse non conforme", texte: text });
    }

    try {
      const jsonClean = text.substring(jsonStart, jsonEnd + 1);
      const extracted = JSON.parse(jsonClean);
      res.json(extracted);
    } catch (parseErr) {
      console.error('❌ Erreur parsing JSON :', parseErr);
      res.status(500).json({ error: 'Erreur parsing Gemini', texte: text });
    }

  } catch (err) {
    console.error('❌ Erreur Gemini OCR :', err);
    res.status(500).json({ error: 'Erreur OCR Gemini' });
  }
});

// ✅ NOUVELLE ROUTE SQL SERVER
app.get('/api/employes-sql', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Employes'); // ← adapte ce nom si besoin
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Erreur SQL Server :', err);
    res.status(500).json({ error: 'Erreur SQL Server' });
  }
});

// 📌 Récupérer UN employé par matricule (depuis SQL Server)
app.get('/api/employes/:matricule', async (req, res) => {
  const { matricule } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('matricule', sql.VarChar, matricule)
      .query('SELECT * FROM Employes WHERE Matricule_Employe = @matricule');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Aucun employé trouvé' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ Erreur SQL employé matricule :', err); // <--- ajoute ceci
    res.status(500).json({ error: 'Erreur SQL' });
  }
});


// 🏠 Test backend
app.get('/', (_, res) => res.send('✅ Backend fusionné opérationnel'));

// 🚀 Serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur backend sur http://localhost:${PORT}`);
});
