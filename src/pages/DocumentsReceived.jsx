import React, { useEffect, useState } from 'react';
import styles from '../styles/DocumentsReceived.module.css';
import Logo from '../assets/cosumar-logo.png';

const API_BASE = 'http://localhost:4000';

export default function DocumentsReceived() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/documents`)
      .then((res) => res.json())
      .then(setDocuments)
      .catch(console.error);
  }, []);

  const docsFiltres = search
    ? documents.filter((doc) =>
        (doc.commentaire && doc.commentaire.toLowerCase().includes(search.toLowerCase())) ||
        (doc.filename && doc.filename.toLowerCase().includes(search.toLowerCase()))
      )
    : documents;

  const handleAddToHistory = async (doc) => {
    try {
      const payload = {
        filename: doc.filename,
        commentaire: doc.commentaire,
        autoFill: doc.autoFill || {}, // si tu as des données préremplies OCR
      };

      const res = await fetch(`${API_BASE}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erreur ajout historique');
      alert('✅ Ajouté à l’historique avec succès.');
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de l’ajout à l’historique.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>📥 Documents reçus</h1>
        <input
          type="text"
          placeholder="🔎 Rechercher un nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {docsFiltres.length > 0 ? (
        <div className={styles.grid}>
          {docsFiltres.map((doc) => (
            <div key={doc.filename} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img
                  src={`${API_BASE}/uploads/${doc.filename}`}
                  alt={doc.filename}
                  className={styles.image}
                />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.commentaire}>📝 {doc.commentaire}</p>
                <p className={styles.date}>📅 {new Date(doc.date).toLocaleString('fr-FR')}</p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={`${API_BASE}/uploads/${doc.filename}`}
                    download
                    className={styles.downloadBtn}
                  >
                    ⬇️ Télécharger
                  </a>

                  <button
                    onClick={() => handleAddToHistory(doc)}
                    className={styles.downloadBtn}
                    style={{ backgroundColor: '#22c55e' }}
                  >
                    ➕ Ajouter à l’historique
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>Aucun document trouvé pour cette recherche.</p>
        </div>
      )}
    </div>
  );
}
