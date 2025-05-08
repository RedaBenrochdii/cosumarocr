import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FileUploader } from '../components/FileUploader';
import { ConsumptionForm } from '../components/ConsumptionForm';
import { DataTable } from '../components/DataTable';
import styles from '../styles/FormPage.module.css';
import * as XLSX from 'xlsx';

const INITIAL_FORM_STATE = {
  DateConsultation: '', Matricule_Employe: '', Nom_Employe: '', Prenom_Employe: '',
  Nom_Malade: '', Prenom_Malade: '', Type_Malade: '', Montant: '', Montant_Rembourse: '', Code_Assurance: '',
  Numero_Declaration: '', Ayant_Droit: ''  // Ajouté Ayant Droit dans l'état initial
};

const EXPORT_FIELDS = [
  'DateConsultation', 'Matricule_Employe', 'Nom_Employe', 'Prenom_Employe',
  'Nom_Malade', 'Prenom_Malade', 'Type_Malade', 'Montant', 'Montant_Rembourse',
  'Code_Assurance', 'Numero_Declaration', 'Ayant_Droit',  // Ajouté Ayant Droit
];

const FormPage = () => {
  const [employesData, setEmployesData] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formList, setFormList] = useLocalStorage('formList', []);

  const handleMatriculeChange = useCallback(e => {
    const matricule = e.target.value;
    setFormData(prev => {
      const base = { ...prev, Matricule_Employe: matricule };
      const emp = employesData.find(x => x.Matricule_Employe === matricule);
      return emp
        ? { ...base, ...emp, DateConsultation: emp.DateConsultation?.split('T')[0] || '' }
        : base;
    });
  }, [employesData]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    console.log('Ajout:', formData);
    setFormList(prev => [...prev, formData]);
    setFormData(INITIAL_FORM_STATE);  // Réinitialiser après ajout
  }, [formData, setFormList]);

  const handleDelete = useCallback(idx => {
    setFormList(prev => prev.filter((_, i) => i !== idx));
  }, [setFormList]);

  const handleDeleteAll = useCallback(() => {
    if (window.confirm('Supprimer toutes les lignes ?')) setFormList([]);
  }, [setFormList]);

  const handleEdit = useCallback((item, idx) => {
    if (window.confirm('Modifier cet enregistrement ?')) {
      setFormData(item);
      setFormList(prev => prev.filter((_, i) => i !== idx));
    }
  }, [setFormList]);

  const makeFilteredWorkbook = list => {
    const filtered = list.map(row =>
      EXPORT_FIELDS.reduce((o, key) => { o[key] = row[key] ?? ''; return o; }, {})
    );
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');
    return wb;
  };

  const handleOpenGmail = useCallback(() => {
    if (!formList.length) return alert('Aucune donnée à exporter');
    const wb = makeFilteredWorkbook(formList);
    XLSX.writeFile(wb, 'DonneesMutuelle.xlsx');
    const to = encodeURIComponent('assurance@example.com');
    const subject = encodeURIComponent('Données Mutuelle');
    const body = encodeURIComponent('Bonjour,\n\nVeuillez trouver ci-joint.');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank');
  }, [formList]);

  return (
    <div className={styles.container}>
      <h1>Formulaire Mutuelle</h1>
      <FileUploader onDataLoaded={setEmployesData} />

      <ConsumptionForm
        formData={formData}
        onMatriculeChange={handleMatriculeChange}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Tableau sans marge et utilisant toute la largeur */}
      <DataTable
        data={formList}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        onEdit={handleEdit}
      />

      <div className={styles.actions}>
        <button onClick={handleOpenGmail} disabled={!formList.length} className={styles.sendButton}>
          Envoyer via Gmail
        </button>
      </div>
    </div>
  );
};

export default FormPage;
