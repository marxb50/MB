export enum UserRole {
  FUNCIONARIO = 'funcionario',
  FISCAL = 'fiscal',
  EMPRESA = 'empresa',
}

export enum ServiceStatus {
  ENVIADO_AO_FISCAL = 'Enviado ao fiscal',
  ENVIADO_A_EMPRESA = 'Enviado à empresa',
  CONCLUIDO = 'Concluído',
}

export type Submission = {
  id: number;
  timestamp: string;
  nome: string;
  localizacao: { lat: number; lng: number } | null;
  dataHora: string;
  servico: string;
  foto_inicial_URL: string; // This will be a base64 data URL in the mock
  status: ServiceStatus;
  foto_conclusao_URL?: string; // Also a base64 data URL
  data_envio_empresa?: string;
  data_conclusao?: string;
};
