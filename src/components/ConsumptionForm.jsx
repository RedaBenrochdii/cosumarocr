import React from 'react';
import styles from '../styles/ConsumptionForm.module.css';
import SmartUploader from './SmartUploader'; // Assure-toi que ce fichier existe

export function ConsumptionForm({
  formData,
  onMatriculeChange,
  onNomChange,
  onChange,
  onSubmit,
  setFormData,
  dependents = []
}) {
  const handleAutoFill = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      Nom_Employe: data.employeeId || prevData.Nom_Employe,
      Type_Malade: data.disease || prevData.Type_Malade,
      Montant: data.amount || prevData.Montant,
      // Ajoute d'autres champs si nécessaires (ex : médecin, déclaration...)
    }));
  };

  return (
    <>
      <SmartUploader onAutoFill={handleAutoFill} />

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          name="Matricule_Employe"
          value={formData.Matricule_Employe}
          onChange={onMatriculeChange}
          placeholder="Matricule Employé"
          required
          className={styles.input}
        />

        <input
          list="noms-employes"
          name="Nom_Employe"
          value={formData.Nom_Employe}
          onChange={onNomChange}
          placeholder="Nom Employé"
          required
          className={styles.input}
        />
        <datalist id="noms-employes">
          {dependents.map((emp, i) => (
            <option key={i} value={emp.Nom_Employe} />
          ))}
        </datalist>

        <input
          name="Prenom_Employe"
          value={formData.Prenom_Employe}
          onChange={onChange}
          placeholder="Prénom Employé"
          required
          className={styles.input}
        />

        <input
          type="date"
          name="DateConsultation"
          value={formData.DateConsultation}
          onChange={onChange}
          required
          className={styles.input}
        />

        <input
          name="Nom_Malade"
          value={formData.Nom_Malade}
          onChange={onChange}
          placeholder="Nom Malade"
          className={styles.input}
        />

        <input
          name="Prenom_Malade"
          value={formData.Prenom_Malade}
          onChange={onChange}
          placeholder="Prénom Malade"
          className={styles.input}
        />

        <input
          name="Type_Malade"
          value={formData.Type_Malade}
          onChange={onChange}
          placeholder="Type Malade"
          className={styles.input}
        />

        <input
          type="number"
          name="Montant"
          value={formData.Montant}
          onChange={onChange}
          placeholder="Montant"
          className={styles.input}
        />

        <input
          type="number"
          name="Montant_Rembourse"
          value={formData.Montant_Rembourse}
          onChange={onChange}
          placeholder="Montant Remboursé"
          className={styles.input}
        />

        <input
          name="Code_Assurance"
          value={formData.Code_Assurance}
          onChange={onChange}
          placeholder="Code Assurance"
          className={styles.input}
        />

        <input
          type="text"
          name="Numero_Declaration"
          value={formData.Numero_Declaration}
          onChange={onChange}
          placeholder="Numéro de déclaration"
          required
          className={styles.input}
        />

        <select
          name="Ayant_Droit"
          id="Ayant_Droit"
          value={formData.Ayant_Droit}
          onChange={onChange}
          required
          className={styles.input}
        >
          <option value="">-- Sélectionner --</option>
          <option value="employe">Employé</option>
          <option value="conjoint">Conjoint</option>
          <option value="enfant">Enfant</option>
        </select>

        <button type="submit" className={styles.button}>
          Ajouter
        </button>
      </form>
    </>
  );
}
