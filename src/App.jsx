import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import Settings from './pages/Settings';
import './index.css';
import EmployeList from './components/EmployeList';

const App = () => {
  return (
    <div style={{ display: 'flex', width: '100%', margin: 0, padding: 0 }}>
  <Sidebar />
  <main style={{ flex: 1, padding: 0, margin: 0 }}>
    <EmployeList />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;