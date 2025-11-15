import { USERS } from '../constants';
import { Submission, ServiceStatus, UserRole } from '../types';

// Este arquivo simula o backend que seria o Code.gs no Google Apps Script.
// Ele usa o localStorage do navegador para persistir os dados, agindo como
// um banco de dados (similar ao Google Sheets no pedido original).

const STORAGE_KEY = 'service_submissions';

const getSubmissions = (): Submission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse submissions from localStorage", error);
    return [];
  }
};

const setSubmissions = (submissions: Submission[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const autenticarLogin = async (usuario: string, senha: string): Promise<{ role: UserRole; error?: string } | { role: null; error: string }> => {
  await simulateDelay(500);
  if (USERS[usuario] && USERS[usuario] === senha) {
    return { role: usuario as UserRole };
  }
  return { role: null, error: 'Usuário ou senha inválidos.' };
};

export const salvarDados = async (data: Omit<Submission, 'id' | 'timestamp' | 'status'>): Promise<{ success: true }> => {
  await simulateDelay(1500);
  const submissions = getSubmissions();
  const newSubmission: Submission = {
    ...data,
    id: submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) + 1 : 1,
    timestamp: new Date().toISOString(),
    status: ServiceStatus.ENVIADO_AO_FISCAL,
  };
  setSubmissions([...submissions, newSubmission]);
  // Simula o envio de email
  console.log(`Email simulado enviado para o fiscal sobre o serviço: ${data.servico}`);
  return { success: true };
};

export const carregarListaFiscal = async (): Promise<Submission[]> => {
  await simulateDelay(1000);
  return getSubmissions().sort((a, b) => b.id - a.id);
};

export const enviarParaEmpresa = async (id: number): Promise<{ success: true }> => {
  await simulateDelay(700);
  const submissions = getSubmissions();
  const updatedSubmissions = submissions.map(s => 
    s.id === id 
      ? { ...s, status: ServiceStatus.ENVIADO_A_EMPRESA, data_envio_empresa: new Date().toISOString() } 
      : s
  );
  setSubmissions(updatedSubmissions);
  // Simula o envio de email
  console.log(`Email simulado enviado para a empresa sobre o serviço ID: ${id}`);
  return { success: true };
};

export const carregarListaEmpresa = async (): Promise<Submission[]> => {
  await simulateDelay(1000);
  const relevantStatuses = [ServiceStatus.ENVIADO_A_EMPRESA, ServiceStatus.CONCLUIDO];
  return getSubmissions()
    .filter(s => relevantStatuses.includes(s.status))
    .sort((a, b) => b.id - a.id);
};

export const concluirServico = async (id: number, foto_conclusao_URL: string): Promise<{ success: true }> => {
  await simulateDelay(1500);
  const submissions = getSubmissions();
  const updatedSubmissions = submissions.map(s => 
    s.id === id 
      ? { ...s, status: ServiceStatus.CONCLUIDO, data_conclusao: new Date().toISOString(), foto_conclusao_URL } 
      : s
  );
  setSubmissions(updatedSubmissions);
  // Simula o envio de email
  console.log(`Email simulado enviado para o fiscal sobre a conclusão do serviço ID: ${id}`);
  return { success: true };
};
