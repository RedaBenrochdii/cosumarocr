import React, { useState } from 'react';
import axios from 'axios';

const SmartUploader = ({ onAutoFill }) => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');
  const [confidence, setConfidence] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:4000/api/upload', formData);
      if (res.data.matchFound) {
        setStatus('✅ Match trouvé, champs remplis automatiquement !');
        setConfidence(res.data.confidenceScore);
        onAutoFill(res.data.autoFill); // Remplit les champs dans le parent
      } else {
        setStatus('❌ Aucun match trouvé.');
        setConfidence(null);
      }
    } catch (err) {
      setStatus('⚠️ Erreur lors de l\'upload.');
      console.error(err);
    }
  };

 
};

export default SmartUploader;
