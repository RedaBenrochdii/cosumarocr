import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const result = await model.generateContent([userMessage]);
      const response = result.response;
      const text = response.text();

      const botMessage = { role: 'model', content: text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur lors de la génération de contenu :', error);
    }
  };

  return (
    <div>
      <h2>Chatbot Gemini</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.role}:</strong> {msg.content}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Entrez votre message..."
        style={{ width: '80%', marginRight: '10px' }}
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
};

export default Chatbot;
