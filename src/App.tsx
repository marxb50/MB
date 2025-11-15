import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import FuncionarioPage from './components/FuncionarioPage';
import FiscalPage from './components/FiscalPage';
import EmpresaPage from './components/EmpresaPage';
import { UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string; role: UserRole } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('user');
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (username: string, role: UserRole) => {
    const userData = { username, role };
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };
  
  if (isInitializing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-black">
             <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
          </div>
      );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  switch (user.role) {
    case UserRole.FUNCIONARIO:
      return <FuncionarioPage user={user} onLogout={handleLogout} />;
    case UserRole.FISCAL:
      return <FiscalPage user={user} onLogout={handleLogout} />;
    case UserRole.EMPRESA:
      return <EmpresaPage user={user} onLogout={handleLogout} />;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
};

export default App;