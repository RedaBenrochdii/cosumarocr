import React, { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ConsumptionForm } from '../components/ConsumptionForm';
import { DataTable } from '../components/DataTable';
import OCRScanner from '../components/OCRScanner';
import styles from '../styles/FormPage.module.css';
import * as XLSX from 'xlsx';
import axios from 'axios';

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
  const [employesData, setEmployesData] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formList, setFormList] = useLocalStorage('formList', []);

  // ✅ Charger automatiquement les données employé depuis le backend
  useEffect(() => {
    axios.get('http://localhost:4000/api/employes')
      .then(res => setEmployesData(res.data))
      .catch(err => console.error("Erreur de chargement des employés :", err));
  }, []);

  const handleAutoFill = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields,
      Montant: fields.Montant?.replace(/\s+/g, '') || '',
      DateConsultation: fields.DateConsultation || new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleMatriculeChange = useCallback(e => {
    const matricule = e.target.value;
    setFormData(prev => {
      const emp = employesData.find(x => x.Matricule_Employe === matricule);
      return emp ? {
        ...prev,
        Matricule_Employe: matricule,
        ...emp,
        DateConsultation: emp.DateConsultation?.split('T')[0] || ''
      } : { ...prev, Matricule_Employe: matricule };
    });
  }, [employesData]);

  const handleNomChange = useCallback(e => {
    const nom = e.target.value;
    setFormData(prev => {
      const base = { ...prev, Nom_Employe: nom };
      const emp = employesData.find(x => x.Nom_Employe.toLowerCase() === nom.toLowerCase());
      return emp
        ? {
            ...base,
            ...emp,
            Matricule_Employe: emp.Matricule_Employe,
            Prenom_Employe: emp.Prenom_Employe,
            DateConsultation: emp.DateConsultation?.split('T')[0] || ''
          }
        : base;
    });
  }, [employesData]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    setFormList(prev => [...prev, formData]);
    setFormData(INITIAL_FORM_STATE);
  }, [formData, setFormList]);

  const handleDelete = useCallback(idx => {
    setFormList(prev => prev.filter((_, i) => i !== idx));
  }, [setFormList]);

  const handleDeleteAll = useCallback(() => {
    if (window.confirm('Supprimer toutes les entrées ?')) setFormList([]);
  }, [setFormList]);

  const handleEdit = useCallback((item, idx) => {
    if (window.confirm('Modifier cette entrée ?')) {
      setFormData(item);
      setFormList(prev => prev.filter((_, i) => i !== idx));
    }
  }, [setFormList]);

  const generateExcelFile = useCallback(() => {
    const filtered = formList.map(row =>
      EXPORT_FIELDS.reduce((acc, key) => ({ ...acc, [key]: row[key] || '' }), {})
    );
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');
    return wb;
  }, [formList]);

  const handleOpenGmail = useCallback(() => {
    if (!formList.length) return alert('Aucune donnée à exporter');

    const wb = generateExcelFile();
    XLSX.writeFile(wb, 'DonneesMutuelle.xlsx');

    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('wafaassurance@gmail.com')}` +
      `&su=${encodeURIComponent('Données Mutuelle')}` +
      `&body=${encodeURIComponent('Bonjour,\n\nVeuillez trouver ci-joint les données.')}`;

    window.open(mailto, '_blank');
  }, [formList, generateExcelFile]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestion Mutuelle</h1>

      <OCRScanner onAutoFill={handleAutoFill} className={styles.ocrSection} />

      <ConsumptionForm
        formData={formData}
        onMatriculeChange={handleMatriculeChange}
        onNomChange={handleNomChange}
        onChange={handleChange}
        onSubmit={handleSubmit}
        dependents={employesData}
      />

      <DataTable
        data={formList}
        columns={EXPORT_FIELDS}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        onEdit={handleEdit}
      />

      <div className={styles.actions}>
        <button onClick={handleOpenGmail} disabled={!formList.length} className={styles.primaryButton}>
          Exporter vers Gmail
        </button>
        <button onClick={handleDeleteAll} className={styles.dangerButton}>
          Tout supprimer
        </button>
      </div>
    </div>
  );
}
