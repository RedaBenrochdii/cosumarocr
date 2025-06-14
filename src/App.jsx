// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FormPage from './pages/FormPage';
import Sidebar from './components/Sidebar';
import EmployeList from './components/EmployeList';
import DocumentsReceived from './pages/DocumentsReceived';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {!isLoginPage && <Sidebar />}
      <main style={{ flex: 1 }}>
        {!isLoginPage && <EmployeList />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/form" element={<PrivateRoute><FormPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><DocumentsReceived /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
