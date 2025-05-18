// src/components/ConsumptionForm.jsx
import React from 'react';
import styles from '../styles/FormPage.module.css';

export function ConsumptionForm({
  formData,
  onMatriculeChange,
  onChange,
  onSubmit,
  dependents = []
}) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <input
        name="Matricule_Employe"
        value={formData.Matricule_Employe}
        onChange={onMatriculeChange}
        placeholder="Matricule Employé"
        required
      />

      <input
        name="Nom_Employe"
        value={formData.Nom_Employe}
        onChange={onChange}
        placeholder="Nom Employé"
        required
      />

      <input
        name="Prenom_Employe"
        value={formData.Prenom_Employe}
        onChange={onChange}
        placeholder="Prénom Employé"
        required
      />

      <input
        type="date"
        name="DateConsultation"
        value={formData.DateConsultation}
        onChange={onChange}
        required
      />

      <input
        name="Nom_Malade"
        value={formData.Nom_Malade}
        onChange={onChange}
        placeholder="Nom Malade"
      />

      <input
        name="Prenom_Malade"
        value={formData.Prenom_Malade}
        onChange={onChange}
        placeholder="Prénom Malade"
      />

      <input
        name="Type_Malade"
        value={formData.Type_Malade}
        onChange={onChange}
        placeholder="Type Malade"
      />

      <input
        type="number"
        name="Montant"
        value={formData.Montant}
        onChange={onChange}
        placeholder="Montant"
      />

      <input
        type="number"
        name="Montant_Rembourse"
        value={formData.Montant_Rembourse}
        onChange={onChange}
        placeholder="Montant Remboursé"
      />

      <input
        name="Code_Assurance"
        value={formData.Code_Assurance}
        onChange={onChange}
        placeholder="Code Assurance"
      />

      <input
        type="text"
        name="Numero_Declaration"
        value={formData.Numero_Declaration}
        onChange={onChange}
        placeholder="Numéro de déclaration"
        required
      />

      <input
        list="dependents-list"
        name="Ayant_Droit"
        value={formData.Ayant_Droit}
        onChange={onChange}
        placeholder="Sélectionner un ayant‑droit"
      />
      <datalist id="dependents-list">
        {dependents.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      <button type="submit" className={styles.submitButton}>
        Ajouter
      </button>
    </form>
  );
}
