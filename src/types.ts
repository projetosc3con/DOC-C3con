export interface Usuario {
  id: string;
  uuid: string;
  fullName: string | null;
  email: string | null;
  profileUrl: string | null;
  idRecurso: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recurso {
  id: string;
  nomeExibicao: string;
  escopo: string | null;
  contagemUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lista {
  id: string;
  nomeLista: string;
  itens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  cnpj?: string;
  telefone?: string;
  setor?: string;
  pontoFocal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Projeto {
  id: number;
  tipoContratacao: string | null;
  descricao: string | null;
  tipo: string | null;
  fase: string | null;
  classificacao: string | null;
  prioridade: string | null;
  responsavel1: string | null;
  fotoRes1: string | null;
  status: boolean;
  justificativaInclusao: string | null;
  createdAt: string;
  updatedAt: string;
  idTipo: string | null;
  dataInicio: string | null;
  objetivo: string | null;
  escopo: string | null;
}

export interface Comentario {
  id: string;
  comentario: string;
  idProjeto: number;
  nomeUser: string;
  emailUser: string;
  fotoUser: string;
  createdAt: string;
  updatedAt: string;
}

export interface TipoProjeto {
  id: string;
  nome: string;
  descricao: string | null;
  createdAt: string;
}

export interface MarcoPadrao {
  id: string;
  idTipo: string;
  nome: string;
  duracaoPadrao: number;
  fase: string | null;
  ordem: number;
  createdAt: string;
}

export interface MarcoProjeto {
  id: string;
  idProjeto: number;
  nome: string;
  fase: string | null;
  dataPrevista: string;
  dataReal: string | null;
  status: string;
  ordem: number;
  createdAt: string;
  updatedAt: string;
}

// Keep existing UI types for Dashboard static data
export interface Project {
  id: string;
  name: string;
  health: 'Estável' | 'Crítico' | 'Em Atenção';
  progress: number;
  deadline: string;
}
