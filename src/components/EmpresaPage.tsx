import React, { useState, useEffect, useCallback } from 'react';
import { Submission, ServiceStatus } from '../types';
import { carregarListaEmpresa, concluirServico } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface EmpresaPageProps {
  user: { username: string };
  onLogout: () => void;
}

const EmpresaPage: React.FC<EmpresaPageProps> = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<{ [key: number]: { photo: string | null, photoPreview: string | null, loading: boolean } }>({});

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const data = await carregarListaEmpresa();
    setSubmissions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionData(prev => ({
          ...prev,
          [id]: { ...prev[id], photo: reader.result as string, photoPreview: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConcluir = async (id: number) => {
    const photo = completionData[id]?.photo;
    if (!photo) {
      alert("Por favor, anexe a foto de conclusão.");
      return;
    }
    setCompletionData(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    await concluirServico(id, photo);
    await fetchSubmissions();
    // Do not reset loading state here to avoid UI flicker, it will be gone on re-render
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Painel da Empresa</h1>
          <button onClick={onLogout} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md">Sair</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-white">Serviços Pendentes e Concluídos</h2>
             <button onClick={fetchSubmissions} disabled={loading} className="text-sm p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors">Atualizar</button>
          </div>
          {loading ? (
             <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map(s => (
                <div key={s.id} className={`p-5 rounded-lg bg-gray-900/50 border-l-4 ${s.status === ServiceStatus.CONCLUIDO ? 'border-green-500' : 'border-blue-500'}`}>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-white">{s.servico} <span className="text-sm font-normal text-gray-400">(ID: {s.id})</span></p>
                      <p className="text-sm text-gray-400">Enviado por: {s.nome} em {new Date(s.dataHora).toLocaleString('pt-BR')}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <a href={`https://www.google.com/maps?q=${s.localizacao?.lat},${s.localizacao?.lng}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-400 hover:underline">Ver Localização</a>
                        <a href={s.foto_inicial_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-green-400 hover:underline">Ver Foto Inicial</a>
                        {s.foto_conclusao_URL && <a href={s.foto_conclusao_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-green-400 hover:underline">Ver Foto de Conclusão</a>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${s.status === ServiceStatus.CONCLUIDO ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  {s.status === ServiceStatus.ENVIADO_A_EMPRESA && (
                    <div className="mt-5 pt-5 border-t border-gray-700 space-y-3">
                      <label className="block text-sm font-medium text-gray-400">Anexar foto de conclusão:</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(s.id, e)} className="block w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-green-400 hover:file:bg-gray-600"/>
                      {completionData[s.id]?.photoPreview && <img src={completionData[s.id]?.photoPreview || ''} alt="Preview Conclusão" className="mt-2 rounded-lg max-h-40 border border-gray-600" />}
                      <button onClick={() => handleConcluir(s.id)} disabled={completionData[s.id]?.loading || !completionData[s.id]?.photo} className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2d7738] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600">
                        {completionData[s.id]?.loading ? <LoadingSpinner /> : 'Marcar como Concluído'}
                      </button>
                    </div>
                  )}
                   {s.status === ServiceStatus.CONCLUIDO && (
                     <p className="mt-3 text-sm text-gray-500">Concluído em: {s.data_conclusao ? new Date(s.data_conclusao).toLocaleString('pt-BR') : 'N/A'}</p>
                   )}
                </div>
              ))}
               {submissions.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-8">Nenhuma solicitação encontrada.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmpresaPage;