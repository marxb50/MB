import React, { useState, useEffect, useCallback } from 'react';
import { Submission, ServiceStatus } from '../types';
import { carregarListaFiscal, enviarParaEmpresa } from '../services/api';

interface FiscalPageProps {
  user: { username: string };
  onLogout: () => void;
}

const FiscalPage: React.FC<FiscalPageProps> = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const data = await carregarListaFiscal();
    setSubmissions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const eligibleSubmissions = submissions.filter(s => s.status === ServiceStatus.ENVIADO_AO_FISCAL);

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          const allSelectableIds = eligibleSubmissions.map(s => s.id);
          setSelectedIds(new Set(allSelectableIds));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSendSelectedToEmpresa = async () => {
    if (selectedIds.size === 0) return;

    setIsBatchUpdating(true);
    // Fix: Using spread syntax to convert Set to array, which has better type inference in some environments.
    const promises = [...selectedIds].map(id => enviarParaEmpresa(id));
    
    try {
        await Promise.all(promises);
    } catch (error) {
        console.error("Falha ao enviar algumas solicitações para a empresa", error);
    }
    
    setSelectedIds(new Set());
    await fetchSubmissions();
    setIsBatchUpdating(false);
  };

  const isAllSelected = eligibleSubmissions.length > 0 && selectedIds.size === eligibleSubmissions.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2d7738]">Painel do Fiscal</h1>
          <button onClick={onLogout} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">Sair</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
             <h2 className="text-xl font-bold text-gray-800">Solicitações Recebidas</h2>
             <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                 <button 
                    onClick={handleSendSelectedToEmpresa} 
                    disabled={loading || isBatchUpdating || selectedIds.size === 0}
                    className="flex-grow sm:flex-grow-0 w-full sm:w-56 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2d7738] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                 >
                    {isBatchUpdating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : `Enviar ${selectedIds.size > 0 ? `(${selectedIds.size}) ` : ''}para Empresa`}
                 </button>
                 <button onClick={fetchSubmissions} disabled={loading || isBatchUpdating} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V4a1 1 0 011-1zm10 8a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 01-1-1v-2a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                 </button>
             </div>
          </div>
          {loading && submissions.length === 0 ? (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7738] mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                       <input 
                            type="checkbox" 
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            checked={isAllSelected}
                            onChange={handleToggleSelectAll}
                            disabled={eligibleSubmissions.length === 0}
                        />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((s) => (
                    <tr key={s.id} className={selectedIds.has(s.id) ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {s.status === ServiceStatus.ENVIADO_AO_FISCAL ? (
                           <input 
                                type="checkbox" 
                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                checked={selectedIds.has(s.id)}
                                onChange={() => handleToggleSelect(s.id)}
                            />
                        ) : null }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.dataHora).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                        <a href={`https://www.google.com/maps?q=${s.localizacao?.lat},${s.localizacao?.lng}`} target="_blank" rel="noopener noreferrer">Ver no mapa</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.servico}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                        <a href={s.foto_inicial_URL} target="_blank" rel="noopener noreferrer">Ver foto</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          s.status === ServiceStatus.ENVIADO_AO_FISCAL ? 'bg-yellow-100 text-yellow-800' : 
                          s.status === ServiceStatus.ENVIADO_A_EMPRESA ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default FiscalPage;