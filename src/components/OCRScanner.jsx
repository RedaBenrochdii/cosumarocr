import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

const extractFieldsFromText = (text) => {
  // Patterns améliorés avec gestion des variantes
  const patterns = {
    Matricule_Employe: /Matricule\s*[_]?\s*Employe?\s*[:]?\s*(\w+)/i,
    Nom_Employe: /Nom\s*[_]?\s*Employe?\s*[:]?\s*([A-Za-zÀ-ÿ- ]+)/i,
    Prenom_Employe: /Pr[ée]nom\s*[_]?\s*Employe?\s*[:]?\s*([A-Za-zÀ-ÿ- ]+)/i,
    Nom_Malade: /Nom\s*[_]?\s*Malade?\s*[:]?\s*([A-Za-zÀ-ÿ- ]+)/i,
    Prenom_Malade: /Pr[ée]nom\s*[_]?\s*Malade?\s*[:]?\s*([A-Za-zÀ-ÿ- ]+)/i,
    Type_Malade: /Type\s*[_]?\s*Malade?\s*[:]?\s*([A-Za-zÀ-ÿ]+)/i,
    Montant: /Montant\s*[:]?\s*([\d\s,\.]+)/i,
    Montant_Rembourse: /Rembours[ée]\s*[:]?\s*([\d\s,\.]+)/i,
    Code_Assurance: /Code\s*[_]?\s*Assurance?\s*[:]?\s*(\w+)/i,
    Numero_Declaration: /(?:Numéro|N°)\s*[_]?\s*D[ée]claration\s*[:]?\s*(\w+)/i,
    DateConsultation: /Date\s*[_]?\s*Consultation?\s*[:]?\s*(\d{4}-\d{2}-\d{2})/i
  };

  return Object.fromEntries(
    Object.entries(patterns).map(([key, regex]) => [
      key,
      (text.match(regex)?.[1]?.trim() || '')
    ])
  );
};

export default function OCRScanner({ onAutoFill }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const workerRef = React.useRef(null);

  useEffect(() => {
    const initializeWorker = async () => {
      workerRef.current = await createWorker('fra');
    };
    initializeWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !workerRef.current) return;

    try {
      setStatus('Traitement...');
      const { data: { text } } = await workerRef.current.recognize(file);
      const fields = extractFieldsFromText(text);
      
      // Post-traitement des valeurs
      const cleanedFields = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [
          key, 
          value.replace(/['"]/g, '') // Enlève les guillemets
        ])
      );

      onAutoFill(cleanedFields);
      setStatus('Terminé');
    } catch (error) {
      console.error("Erreur OCR:", error);
      setStatus('Échec');
    }
  };

  return (
    <div className="ocr-section">
      <label className="ocr-upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="ocr-input"
        />
        <span className="ocr-button">
        </span>
      </label>
      {status && <div className="ocr-status">{status}</div>}
    </div>
  );
}