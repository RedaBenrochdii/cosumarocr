import React from 'react';
import styles from '../styles/FormPage.module.css';

export function DataTable({ data, onDelete, onDeleteAll, onEdit }) {
  return (
    <div className={styles.scrollContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Nom Malade</th>
            <th>Prénom Malade</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Remboursé</th>
            <th>Code Assurance</th>
            <th>Déclaration</th>
            <th>Ayant droit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.DateConsultation}</td>
              <td>{item.Matricule_Employe}</td>
              <td>{item.Nom_Employe}</td>
              <td>{item.Prenom_Employe}</td>
              <td>{item.Nom_Malade}</td>
              <td>{item.Prenom_Malade}</td>
              <td>{item.Type_Malade}</td>
              <td>{item.Montant}</td>
              <td>{item.Montant_Rembourse}</td>
              <td>{item.Code_Assurance}</td>
              <td>{item.Numero_Declaration}</td>
              <td>{item.Ayant_Droit}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onEdit(item, idx)} className={styles.sendButton}>
                    Modifier
                  </button>
                  <button onClick={() => onDelete(idx)} className={styles.deleteAllButton}>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length > 0 && (
        <div className="text-center mt-6">
          <button onClick={onDeleteAll} className={styles.deleteAllButton}>
            Supprimer Tout
          </button>
        </div>
      )}
    </div>
  );
}
