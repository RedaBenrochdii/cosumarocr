import React from 'react';
import * as XLSX from 'xlsx';

export function FileUploader({ onDataLoaded }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        const formatted = json.map(emp => ({
          ...emp,
          Matricule_Employe: emp.Matricule_Employe ? String(emp.Matricule_Employe) : ''
        }));
        onDataLoaded(formatted);
      } catch (err) {
        console.error('Excel parse error', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleFile}
    />
  );
}
