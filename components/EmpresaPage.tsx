
import React, { useState, useEffect, useCallback } from 'react';
import { Submission, ServiceStatus } from '../types';
import { carregarListaEmpresa, concluirServico } from '../services/api';

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
    setCompletionData(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2d7738]">Painel da Empresa</h1>
          <button onClick={onLogout} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">Sair</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800">Serviços Pendentes e Concluídos</h2>
             <button onClick={fetchSubmissions} disabled={loading} className="text-sm p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Atualizar</button>
          </div>
          {loading ? (
             <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7738] mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map(s => (
                <div key={s.id} className={`p-4 rounded-lg shadow border-l-4 ${s.status === ServiceStatus.CONCLUIDO ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-800">{s.servico} <span className="text-sm font-normal text-gray-500">(ID: {s.id})</span></p>
                      <p className="text-sm text-gray-600">Enviado por: {s.nome} em {new Date(s.dataHora).toLocaleString('pt-BR')}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <a href={`https://www.google.com/maps?q=${s.localizacao?.lat},${s.localizacao?.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Localização</a>
                        <a href={s.foto_inicial_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Foto Inicial</a>
                        {s.foto_conclusao_URL && <a href={s.foto_conclusao_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Foto de Conclusão</a>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${s.status === ServiceStatus.CONCLUIDO ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  {s.status === ServiceStatus.ENVIADO_A_EMPRESA && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Anexar foto de conclusão:</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(s.id, e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#2d7738] hover:file:bg-green-100"/>
                      {completionData[s.id]?.photoPreview && <img src={completionData[s.id]?.photoPreview || ''} alt="Preview Conclusão" className="mt-2 rounded-lg max-h-40" />}
                      <button onClick={() => handleConcluir(s.id)} disabled={completionData[s.id]?.loading} className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2d7738] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                        {completionData[s.id]?.loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Marcar como Concluído'}
                      </button>
                    </div>
                  )}
                   {s.status === ServiceStatus.CONCLUIDO && (
                     <p className="mt-2 text-sm text-gray-500">Concluído em: {s.data_conclusao ? new Date(s.data_conclusao).toLocaleString('pt-BR') : 'N/A'}</p>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmpresaPage;
