import { Milestone, Project, Resource, User } from './types';

export const milestones: Milestone[] = [
  {
    id: '1',
    name: 'Termo de Abertura (TAP)',
    phase: 'Iniciação',
    dueDate: '10 Jan, 2024',
    status: 'CONCLUÍDO',
    responsible: { name: 'Ricardo Oliveira', avatar: 'https://i.pravatar.cc/150?u=1' }
  },
  {
    id: '2',
    name: 'Plano de Gerenciamento',
    phase: 'Planejamento',
    dueDate: '25 Jan, 2024',
    status: 'CONCLUÍDO',
    responsible: { name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/150?u=2' }
  },
  {
    id: '3',
    name: 'Protótipo de Interface',
    phase: 'Execução',
    dueDate: '15 Fev, 2024',
    status: 'EM ANDAMENTO',
    responsible: { name: 'Marina Costa', avatar: 'https://i.pravatar.cc/150?u=3' }
  },
  {
    id: '4',
    name: 'Homologação de Dados',
    phase: 'Monitoramento',
    dueDate: '02 Mar, 2024',
    status: 'PENDENTE',
    responsible: { name: 'Jorge Mendes', avatar: 'https://i.pravatar.cc/150?u=4' }
  },
  {
    id: '5',
    name: 'Go-Live Sistema Alpha',
    phase: 'Execução / Entrega Final',
    dueDate: '20 Mar, 2024',
    status: 'ATRASO CRÍTICO',
    responsible: { name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/150?u=2' }
  }
];

export const projects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Sistema Mobile 2.0',
    client: 'Banco Global S.A.',
    deadline: '15 Dez, 2024',
    startDate: '01 Jan, 2024',
    budget: 'R$ 450.000,00',
    health: 'Estável',
    tipoContratacao: 'CLT',
    manager: 'Ana Silva',
    progress: 65,
    description: 'Desenvolvimento da nova versão do aplicativo mobile com foco em experiência do usuário e segurança avançada.',
    scope: 'Desenvolvimento de front-end React Native, back-end Node.js, integração com APIs de pagamento e auditoria de segurança.',
    objective: 'Aumentar a retenção de usuários em 25% e reduzir o tempo de transação em 40%.',
    justification: 'A versão atual do aplicativo possui falhas de performance críticas e uma interface datada que não atende aos novos padrões do mercado financeiro.',
    milestones: [
      { id: '1', name: 'Definição de Requisitos', progress: 100, baselineDate: '01/01/2024', scheduledDate: '05/01/2024', active: true },
      { id: '2', name: 'Arquitetura do Sistema', progress: 100, baselineDate: '15/01/2024', scheduledDate: '20/01/2024', active: true },
      { id: '3', name: 'Desenvolvimento UI/UX', progress: 80, baselineDate: '01/02/2024', scheduledDate: '10/02/2024', active: true },
      { id: '4', name: 'Integração de APIs', progress: 40, baselineDate: '01/03/2024', scheduledDate: '15/03/2024', active: true },
      { id: '5', name: 'Testes de Segurança', progress: 0, baselineDate: '01/04/2024', scheduledDate: '10/04/2024', active: false },
    ],
    financials: [
      { month: 'Jan', planned: 50000, projected: 48000 },
      { month: 'Fev', planned: 50000, projected: 52000 },
      { month: 'Mar', planned: 60000, projected: 65000 },
      { month: 'Abr', planned: 60000, projected: 60000 },
      { month: 'Mai', planned: 40000, projected: 45000 },
      { month: 'Jun', planned: 40000, projected: 40000 },
      { month: 'Jul', planned: 40000, projected: 40000 },
      { month: 'Ago', planned: 30000, projected: 30000 },
      { month: 'Set', planned: 30000, projected: 30000 },
      { month: 'Out', planned: 20000, projected: 20000 },
      { month: 'Nov', planned: 20000, projected: 20000 },
      { month: 'Dez', planned: 10000, projected: 10000 },
    ],
    comments: [
      {
        id: 'c1',
        author: { name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/150?u=carlos', role: 'Gerente de Projetos' },
        content: 'A fase de design foi concluída com sucesso. Iniciando o desenvolvimento do backend.',
        timestamp: 'Ontem às 14:30'
      },
      {
        id: 'c2',
        author: { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=ana', role: 'Diretora de TI' },
        content: 'Excelente progresso. Por favor, mantenham o foco na segurança das transações.',
        timestamp: 'Hoje às 09:15'
      }
    ]
  },
  {
    id: 'PRJ-002',
    name: 'Rebranding Marca',
    client: 'TechInnova Ltda',
    deadline: '20 Nov, 2024',
    startDate: '15 Mar, 2024',
    budget: 'R$ 120.000,00',
    health: 'Crítico',
    tipoContratacao: 'PJ',
    manager: 'Carlos Oliveira',
    progress: 40,
    description: 'Reposicionamento completo da marca TechInnova no mercado digital, incluindo nova identidade visual e estratégia de comunicação.',
    comments: []
  },
  {
    id: 'PRJ-003',
    name: 'Expansão de Planta',
    client: 'Logix Corp.',
    deadline: '05 Jan, 2025',
    startDate: '10 Mai, 2024',
    budget: 'R$ 2.500.000,00',
    health: 'Em Atenção',
    tipoContratacao: 'Terceirizado',
    manager: 'Mariana Costa',
    progress: 80,
    description: 'Ampliação da capacidade produtiva da unidade de São Paulo em 30% através da construção de um novo galpão industrial.',
    comments: []
  }
];

export const resources: Resource[] = [
  {
    id: '1',
    name: 'Ana Oliveira (Engenheira)',
    type: 'Humano',
    status: 'Disponível',
    capacity: '100% (40h/sem)',
    cost: 'R$ 12.450,00'
  },
  {
    id: '2',
    name: 'Escavadeira CAT-320',
    type: 'Equipamento',
    status: 'Alocado',
    capacity: '1 Unidade',
    cost: 'R$ 45.900,00'
  }
];

export const users: User[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos.silva@empresa.com.br',
    cpf: '123.456.789-00',
    resourceId: '1',
    accessLevel: 'Administrador',
    avatar: 'https://i.pravatar.cc/150?u=carlos'
  },
  {
    id: '2',
    name: 'Marina Costa',
    email: 'marina.costa@empresa.com.br',
    cpf: '987.654.321-11',
    resourceId: '1',
    accessLevel: 'Gerente',
    avatar: 'https://i.pravatar.cc/150?u=marina'
  }
];
