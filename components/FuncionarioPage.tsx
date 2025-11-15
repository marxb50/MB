
import React, { useState, useEffect } from 'react';
import { Submission } from '../types';
import { salvarDados } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface FuncionarioPageProps {
  user: { username: string };
  onLogout: () => void;
}

const FuncionarioPage: React.FC<FuncionarioPageProps> = ({ user, onLogout }) => {
  const [nome, setNome] = useState(user.username);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [dataHora, setDataHora] = useState(new Date().toLocaleString('pt-BR'));
  const [servico, setServico] = useState('Poda');
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocalizacao({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError('');
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError('Não foi possível obter a localização. Verifique as permissões do navegador.');
      }
    );
    const timer = setInterval(() => setDataHora(new Date().toLocaleString('pt-BR')), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setServico('Poda');
    setFoto(null);
    setFotoPreview(null);
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto || !localizacao || !nome) {
      setSubmitStatus('error');
      return;
    }
    setLoading(true);
    setSubmitStatus('idle');

    const dados: Omit<Submission, 'id' | 'timestamp' | 'status'> = {
      nome,
      localizacao,
      dataHora,
      servico,
      foto_inicial_URL: foto,
    };

    const result = await salvarDados(dados);
    setLoading(false);
    if (result.success) {
      setSubmitStatus('success');
      resetForm();
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } else {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
            <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#2d7738]">Portal do Funcionário</h1>
                <button onClick={onLogout} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">Sair</button>
            </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Solicitação de Serviço</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Localização (GPS)</label>
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-100 rounded-md h-9">
                            {localizacao ? `${localizacao.lat.toFixed(5)}, ${localizacao.lng.toFixed(5)}` : 'Obtendo...'}
                        </p>
                        {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                        <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-100 rounded-md h-9">{dataHora}</p>
                    </div>
                    <div>
                        <label htmlFor="servico" className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
                        <select id="servico" value={servico} onChange={(e) => setServico(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            <option>Poda</option>
                            <option>Capinação</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload de Foto</label>
                        <input id="foto" type="file" accept="image/*" capture="environment" required onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#2d7738] hover:file:bg-green-100" />
                        {fotoPreview && <img src={fotoPreview} alt="Preview" className="mt-4 rounded-lg max-h-60" />}
                    </div>
                    <div>
                        <button type="submit" disabled={loading || !localizacao} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2d7738] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                           {loading ? <LoadingSpinner /> : 'ENVIAR'}
                        </button>
                    </div>
                    {submitStatus === 'success' && <p className="text-green-600 text-center">Solicitação enviada com sucesso!</p>}
                    {submitStatus === 'error' && <p className="text-red-600 text-center">Falha ao enviar. Preencha todos os campos e tente novamente.</p>}
                </form>
            </div>
        </main>
    </div>
  );
};

export default FuncionarioPage;
