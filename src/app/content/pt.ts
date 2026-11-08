import { SISPEC_STACK, WORKED_STACK } from './profile';
import type { SiteContent } from './types';

/** PT-BR content. Source of truth: the PT-BR résumé. */
export const PT: SiteContent = {
  meta: {
    title: 'Mateus de Jesus Santos | Desenvolvedor Full Stack Pleno (Angular)',
    description:
      'Portfólio de Mateus de Jesus Santos, desenvolvedor Full Stack Pleno com foco em front-end Angular e TypeScript e experiência em Java e Spring Boot.',
    imageAlt:
      'Cartão de apresentação de Mateus de Jesus Santos: foto, nome e "Full Stack · Angular" sobre fundo roxo',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    themeToggle: 'Tema escuro',
    mainNavigation: 'Navegação principal',
    menu: 'Menu',
    opensInNewTab: '(abre em nova aba)',
  },
  nav: [
    { id: 'about', label: 'Sobre', eyebrow: 'Perfil' },
    { id: 'experience', label: 'Experiência', eyebrow: 'Trajetória' },
    { id: 'projects', label: 'Projetos', eyebrow: 'Trabalho' },
    { id: 'skills', label: 'Habilidades', eyebrow: 'Stack' },
    { id: 'education', label: 'Formação', eyebrow: 'Estudos' },
    { id: 'contact', label: 'Contato', eyebrow: 'Conversa' },
  ],
  hero: {
    name: 'Mateus de Jesus Santos',
    role: 'Desenvolvedor Full Stack Pleno | Front-end Angular',
    tagline: 'Front-end com Angular e TypeScript, com experiência em back-end Java e Spring Boot.',
    location: 'Sergipe, Brasil',
    photoAlt: 'Foto de Mateus de Jesus Santos',
    resumeLabel: 'Baixar currículo',
    contactLabel: 'Contato',
    profilesLabel: 'Perfis profissionais',
    stackLabel: 'Principais tecnologias',
  },
  about: {
    heading: 'Sobre',
    summary:
      'Desenvolvedor Full Stack Pleno com Bacharelado em Sistemas de Informação, especializado em Front-end com Angular e TypeScript, e experiência complementar em Back-end com Java e Spring Boot. Atuação consolidada no desenvolvimento e manutenção de sistemas web para gestão pública na área da saúde, com foco em componentes escaláveis, gerenciamento de estado complexo e integração com APIs RESTful. Experiência em orientação técnica de desenvolvedores, definição de padrões de código e participação em todo o ciclo de desenvolvimento, do protótipo ao deploy em produção. Combina rigor técnico, código limpo e colaboração constante em equipe para entregar soluções de alto impacto.',
    highlights: [
      {
        title: 'Mentoria técnica',
        text: 'Orientando estagiários e novos desenvolvedores em regras de negócio e boas práticas com Angular, RxJS e SASS.',
      },
      {
        title: 'Padrões de código',
        text: 'Padrões de código e checklists de validação técnica para Pull Requests.',
      },
      {
        title: 'Testes automatizados',
        text: 'Testes automatizados com Jest por iniciativa própria no sistema SISPEC.',
      },
      {
        title: 'Do protótipo ao deploy',
        text: 'Participação em todo o ciclo de desenvolvimento, do protótipo ao deploy em produção.',
      },
    ],
  },

  experience: {
    heading: 'Experiência',
    positions: [
      {
        role: 'Desenvolvedor Full Stack Pleno',
        company: 'MMS Soluções e Consultoria',
        period: 'Junho/2026 – Atual',
        current: true,
        highlights: [
          'Evoluo a arquitetura do monorepo Nx do sistema SISPEC, tendo criado o módulo de Urgência e Emergência e refatorado a lib compartilhada entre módulos, além de estabelecer padrões de código e checklists de validação técnica para Pull Requests.',
          'Atuo como referência técnica da equipe, orientando desenvolvedores em regras de negócio do domínio de saúde pública, revisão crítica de código e destravamento de tarefas complexas.',
          'Desenvolvo e evoluo interfaces em Angular e RxJS, com foco em componentes escaláveis, gerenciamento de estado complexo em painéis de atendimento médico e estilização responsiva para profissionais da saúde.',
          'Contribuo no back-end com Java e Spring Boot, implementando ajustes pontuais e participando ativamente de deploys em ambientes de homologação e produção para sistemas governamentais de saúde pública.',
          'Introduzo testes automatizados com Jest por iniciativa própria no sistema SISPEC, abrangendo os módulos de Atenção Primária e Urgência e Emergência e a lib compartilhada, criando uma rede de segurança para validar features, inclusive as desenvolvidas com apoio de ferramentas de IA.',
        ],
      },
      {
        role: 'Desenvolvedor Full Stack Junior',
        company: 'MMS Soluções e Consultoria',
        period: 'Novembro/2024 – Junho/2026',
        current: false,
        highlights: [
          'Liderei o desenvolvimento front-end do sistema SISPEC, definindo padrões de desenvolvimento, estruturando checklists de validação para Pull Requests e orientando estagiários e novos desenvolvedores em regras de negócio e boas práticas com Angular, RxJS e SASS.',
          'Desenvolvi a maior parte das interfaces do sistema de Almoxarifado e atuei como único desenvolvedor front-end do painel médico de prioridades do IPE Saúde, com foco em modularização e componentes reutilizáveis.',
          'Construí APIs RESTful seguras em Java e Spring Boot e resolvi bugs críticos para os projetos Almoxarifado e SISPEC, mantendo padrões de código limpo.',
          'No sistema de Regulação, ajustei os serviços da API e desenvolvi o script de unificação, aplicado em produção, de cadastros de Pacientes e Prestadores com mesmo CPF ou CNS, sob prazo apertado; também desenvolvi telas de front-end da APAC (Autorização de Procedimento Ambulatorial).',
          'Participei das esteiras de entrega, com deploys constantes em homologação e produção.',
        ],
      },
    ],
  },
  projects: {
    heading: 'Projetos',
    worked: {
      heading: 'Sistemas em que atuei',
      note: 'Sistemas governamentais de saúde pública: por isso, não exibo telas, dados nem detalhes internos.',
      roleLabel: 'Atuação',
      stackLabel: 'Tecnologias',
      systems: [
        {
          id: 'sispec',
          name: 'SISPEC',
          role: 'Liderança do desenvolvimento front-end e evolução da arquitetura do monorepo Nx; criação do módulo de Urgência e Emergência; testes automatizados com Jest.',
          stack: SISPEC_STACK,
        },
        {
          id: 'almoxarifado',
          name: 'Almoxarifado',
          role: 'Desenvolvimento da maior parte das interfaces; APIs RESTful e correção de bugs críticos.',
          stack: WORKED_STACK,
        },
        {
          id: 'ipe-saude',
          name: 'Painel médico de prioridades do IPE Saúde',
          role: 'Único desenvolvedor front-end, com foco em modularização e componentes reutilizáveis.',
          stack: WORKED_STACK,
        },
        {
          id: 'regulacao',
          name: 'Regulação',
          role: 'Ajustes nos serviços da API, script de unificação de cadastros aplicado em produção e telas de front-end da APAC.',
          stack: WORKED_STACK,
        },
      ],
    },
    personal: {
      heading: 'Projetos pessoais: em breve',
      comingSoonLabel: 'Em breve',
      githubLabel: 'Ver meu GitHub',
      items: [{ status: 'coming-soon' }, { status: 'coming-soon' }, { status: 'coming-soon' }],
    },
  },
  skills: {
    heading: 'Habilidades',
    groups: [
      {
        id: 'technical',
        title: 'Técnicas',
        items: [
          'Angular',
          'TypeScript',
          'JavaScript',
          'RxJS',
          'Nx',
          'Tailwind CSS',
          'Jest',
          'SASS',
          'Java',
          'Spring Boot',
          'PostgreSQL',
          'SQL',
        ],
      },
      {
        id: 'tools',
        title: 'Ferramentas',
        items: [
          'Git',
          'GitHub',
          'GitHub Actions',
          'Docker',
          'VSCode',
          'IntelliJ',
          'DBeaver',
          'Figma (leitura de layouts)',
        ],
      },
      { id: 'methodologies', title: 'Metodologias', items: ['Scrum'] },
      {
        id: 'interpersonal',
        title: 'Interpessoais',
        items: [
          'Mentoria técnica',
          'Comunicação com áreas de negócio',
          'Resolução de problemas sob prazo',
          'Colaboração multidisciplinar',
        ],
      },
    ],
  },
  education: {
    heading: 'Formação e idiomas',
    degreesHeading: 'Formação acadêmica',
    degrees: [
      {
        title: 'Bacharelado em Sistemas de Informação',
        institution: 'Instituto Federal de Sergipe – Campus Lagarto',
        period: 'Março/2022 – Junho/2026',
      },
      {
        title: 'Técnico em Desenvolvimento de Sistemas',
        institution: 'Instituto Federal de Sergipe – Campus Tobias Barreto',
        period: 'Março/2019 – Janeiro/2022',
      },
    ],
    languagesHeading: 'Idiomas',
    languages: [
      { name: 'Português', level: 'Nativo' },
      { name: 'Inglês', level: 'Intermediário' },
      { name: 'Espanhol', level: 'Básico' },
    ],
  },
  contact: {
    heading: 'Contato',
    intro:
      'Conversas sobre oportunidades em desenvolvimento de software com Angular, TypeScript, Java ou Spring Boot são bem-vindas.',
    emailLabel: 'E-mail',
    emailCta: 'Enviar e-mail',
  },
  footer: {
    sourceCode: 'Código-fonte deste site',
    license: 'Licença MIT',
    backToTop: 'Voltar ao topo',
  },
  notFound: {
    title: 'Página não encontrada',
    message: 'O endereço que você tentou acessar não existe.',
    backLabel: 'Voltar ao início',
  },
};
