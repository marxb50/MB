import React, { useState } from 'react';
import { autenticarLogin } from '../services/api';
import { UserRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface LoginPageProps {
  onLogin: (username: string, role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await autenticarLogin(username, password);
    setLoading(false);
    if (result.role) {
      onLogin(username, result.role);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-md">
        <h2 className="text-3xl font-bold mb-6">
          Acessar Sistema
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center">
              <label htmlFor="username" className="w-20 text-lg">Usuário</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
          </div>
           <div className="flex items-center">
               <label htmlFor="password" className="w-20 text-lg">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>

          {error && <p className="text-red-400 text-sm pt-2">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center py-2 px-6 border border-gray-500 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;