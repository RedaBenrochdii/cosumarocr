// src/components/EmployeList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';

function EmployeList() {
  const [employes, setEmployes] = useState([]);

  useEffect(() => {
    api.get('/employes')
      .then((res) => setEmployes(res.data))
      .catch((err) => console.error('Erreur API:', err));
  }, []);

  return (
    <div>
      <h2></h2>
      <ul>
        {employes.map((e) => (
          <li key={e.id}>{e.nom} {e.prenom} - Matricule: {e.matricule}</li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeList;
