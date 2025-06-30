import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { ConsumptionForm } from '../components/ConsumptionForm';
import { DataTable } from '../components/DataTable';
import OCRScanner from '../components/OCRScanner';
import styles from '../styles/FormPage.module.css';

const INITIAL_FORM_STATE = {
  DateConsultation: '',
  Matricule_Employe: '',
  Nom_Employe: '',
  Prenom_Employe: '',
  Nom_Malade: '',
  Prenom_Malade: '',
  Type_Malade: '',
  Montant: '',
  Montant_Rembourse: '',
  Code_Assurance: '',
  Numero_Declaration: '',
  Ayant_Droit: ''
};

const EXPORT_FIELDS = Object.keys(INITIAL_FORM_STATE);

export default function FormPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formList, setFormList] = useLocalStorage('formList', []);
  const [showCalc, setShowCalc] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isDateValid, setIsDateValid] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const updateFormData = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMatriculeChange = useCallback(async (e) => {
    const value = e.target.value;
    updateFormData('Matricule_Employe', value);

    if (value.trim() !== '') {
      try {
        const res = await axios.get(`http://localhost:4000/api/employes/${value}`);
        const emp = res.data;
        if (emp) {
          setFormData(prev => ({
            ...prev,
            Matricule_Employe: emp.Matricule_Employe || prev.Matricule_Employe,
            Nom_Employe: emp.Nom_Employe || '',
            Prenom_Employe: emp.Prenom_Employe || ''
          }));
        }
      } catch (error) {
        console.error('Erreur chargement employé :', error);
      }
    }
  }, [updateFormData]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    updateFormData(name, value);

    if (name === 'DateConsultation') {
      const inputDate = new Date(value);
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      if (inputDate < threeMonthsAgo) {
        setIsDateValid(false);
        alert("⚠️ Le dossier dépasse 3 mois, il pourrait être rejeté. Veuillez vérifier la date.");
      } else {
        setIsDateValid(true);
      }
    }
  }, [updateFormData]);

  const handleAutoFill = useCallback(fields => {
    setFormData(prev => ({
      ...prev,
      ...fields,
      Montant: fields.Montant?.replace(/\s+/g, '') || '',
      DateConsultation: fields.DateConsultation || new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    setFormList(prev => [...prev, formData]);
    setFormData(INITIAL_FORM_STATE);
    setIsDateValid(true);
  }, [formData, setFormList]);

  const handleDelete = useCallback(idx => {
    setFormList(prev => prev.filter((_, i) => i !== idx));
  }, [setFormList]);

  const handleDeleteAll = useCallback(() => {
    if (window.confirm('Supprimer toutes les entrées ?')) {
      setFormList([]);
    }
  }, [setFormList]);

  const handleEdit = useCallback((item, idx) => {
    if (window.confirm('Modifier cette entrée ?')) {
      setFormData(item);
      setFormList(prev => prev.filter((_, i) => i !== idx));
    }
  }, [setFormList]);

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(formList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');
    XLSX.writeFile(wb, 'DonneesMutuelle.xlsx');
  }, [formList]);

  const handleOpenGmail = useCallback(() => {
    if (!formList.length) {
      return alert('Aucune donnée à exporter');
    }
    exportExcel();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=wafaassurance@gmail.com&su=Données+Mutuelle&body=Bonjour,%0D%0AVeuillez+trouver+ci-joint+les+données.`,
      '_blank'
    );
  }, [formList, exportExcel]);

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '6px 12px',
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>
      </div>

      <h1 className={styles.title}>Gestion Mutuelle</h1>

      <OCRScanner onAutoFill={handleAutoFill} className={styles.ocrSection} />

      <ConsumptionForm
        formData={formData}
        onMatriculeChange={handleMatriculeChange}
        onNomChange={handleChange}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isDateValid={isDateValid}
      />

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setShowCalc(!showCalc)}
          style={{
            padding: '8px 12px',
            background: '#f3f3f3',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🧮 Ouvrir la calculatrice
        </button>

        {showCalc && (
          <div style={{
            marginTop: '10px',
            background: 'var(--card-bg)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            width: '260px',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.1)'
          }}>
            <input
              type="text"
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              placeholder="Ex: 150+300+90"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            />
            <div>
              <button
                onClick={() => {
                  try {
                    const result = eval(calcInput);
                    setCalcInput(result.toString());
                  } catch {
                    alert("Erreur de calcul");
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '8px'
                }}
              >
                = Calculer
              </button>

              <button
                onClick={() => setCalcInput('')}
                style={{
                  padding: '6px 12px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Effacer
              </button>
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={formList}
        columns={EXPORT_FIELDS}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        onEdit={handleEdit}
      />

      <div className={styles.actions}>
        <button
          onClick={handleOpenGmail}
          disabled={!formList.length}
          className={styles.primaryButton}
        >
          Exporter vers Gmail
        </button>

        <button
          onClick={handleDeleteAll}
          className={styles.dangerButton}
        >
        
        </button>
      </div>
    </div>
  );
}
