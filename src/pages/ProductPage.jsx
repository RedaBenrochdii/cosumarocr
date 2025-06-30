// ProductionDashboard.jsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/ProductPage.module.css';
import axios from 'axios';

export default function ProductionDashboard() {
  const [employes, setEmployes] = useState([]);
  const [selectedMatricule, setSelectedMatricule] = useState('');
  const [newMember, setNewMember] = useState({ nom: '', prenom: '', type: '' });
  const [newEmploye, setNewEmploye] = useState({ Matricule_Employe: '', Nom_Employe: '', Prenom_Employe: '' });

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/employes');
      setEmployes(res.data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  const selectedEmploye = employes.find(emp => emp.Matricule_Employe === selectedMatricule);

  const handleAddEmploye = async () => {
    if (!newEmploye.Matricule_Employe || !newEmploye.Nom_Employe) {
      return alert("⚠️ Matricule et Nom requis");
    }
    try {
      await axios.post('http://localhost:4000/api/employes', newEmploye);
      setNewEmploye({ Matricule_Employe: '', Nom_Employe: '', Prenom_Employe: '' });
      fetchEmployes();
    } catch (err) {
      alert("❌ Erreur ajout employé");
    }
  };

  const handleDeleteEmploye = async () => {
    if (!selectedMatricule) return;
    try {
      await axios.delete(`http://localhost:4000/api/employes/${selectedMatricule}`);
      setSelectedMatricule('');
      fetchEmployes();
    } catch (err) {
      alert("❌ Erreur suppression");
    }
  };

  const handleAddMember = async () => {
    if (!newMember.nom || !newMember.type || !selectedMatricule) return alert("⚠️ Champs famille requis");
    try {
      await axios.post(`http://localhost:4000/api/employes/${selectedMatricule}/famille`, newMember);
      setNewMember({ nom: '', prenom: '', type: '' });
      fetchEmployes();
    } catch (err) {
      alert("❌ Erreur ajout membre");
    }
  };

  const handleDeleteMember = async (index) => {
    try {
      await axios.delete(`http://localhost:4000/api/employes/${selectedMatricule}/famille/${index}`);
      fetchEmployes();
    } catch (err) {
      alert("❌ Erreur suppression membre");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestion Situation Familiale</h2>

      <div className={styles.form}>
        <h3>➕ Ajouter un nouvel employé</h3>
        <input placeholder="Matricule" value={newEmploye.Matricule_Employe}
          onChange={e => setNewEmploye({ ...newEmploye, Matricule_Employe: e.target.value })}
          className={styles.input} />
        <input placeholder="Nom" value={newEmploye.Nom_Employe}
          onChange={e => setNewEmploye({ ...newEmploye, Nom_Employe: e.target.value })}
          className={styles.input} />
        <input placeholder="Prénom" value={newEmploye.Prenom_Employe}
          onChange={e => setNewEmploye({ ...newEmploye, Prenom_Employe: e.target.value })}
          className={styles.input} />
        <button onClick={handleAddEmploye} className={styles.primaryButton}>Ajouter Employé</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label> Sélectionner un employé :</label><br />
        <select
          value={selectedMatricule}
          onChange={(e) => setSelectedMatricule(e.target.value)}
          className={styles.input}
        >
          <option value="">-- Choisir un matricule --</option>
          {employes.map((emp, i) => (
            <option key={i} value={emp.Matricule_Employe}>
              {emp.Matricule_Employe} - {emp.Nom_Employe} {emp.Prenom_Employe}
            </option>
          ))}
        </select>
      </div>

      {selectedEmploye && (
        <>
          <h3 className={styles.subtitle}>👨‍👩‍👧‍👦 Famille de {selectedEmploye.Nom_Employe}</h3>
          <ul>
            {(selectedEmploye.Famille || []).map((f, i) => (
              <li key={i}>
                👤 {f.type} : {f.nom} {f.prenom}
                <button onClick={() => handleDeleteMember(i)} style={{ marginLeft: '10px', color: 'red' }}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.form}>
            <input placeholder="Nom" value={newMember.nom}
              onChange={e => setNewMember({ ...newMember, nom: e.target.value })}
              className={styles.input} />
            <input placeholder="Prénom" value={newMember.prenom}
              onChange={e => setNewMember({ ...newMember, prenom: e.target.value })}
              className={styles.input} />
            <select value={newMember.type}
              onChange={e => setNewMember({ ...newMember, type: e.target.value })}
              className={styles.input}
            >
              <option value="">-- Type --</option>
              <option value="conjoint">Conjoint(e)</option>
              <option value="enfant">Enfant</option>
              <option value="autre">Autre</option>
            </select>
            <button onClick={handleAddMember} className={styles.primaryButton}>➕ Ajouter à la famille</button>
            <button onClick={handleDeleteEmploye} className={styles.dangerButton}>🗑️ Supprimer Employé</button>
          </div>
        </>
      )}
    </div>
  );
}
