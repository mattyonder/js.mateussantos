import { SISPEC_STACK, WORKED_STACK } from './profile';
import type { SiteContent } from './types';

/** PT-BR content. Source of truth: the PT-BR résumé. */
export const PT: SiteContent = {
  meta: {
    title: 'Mateus de Jesus Santos | Desenvolvedor Full Stack Pleno (Angular)',
    description:
      'Portfólio de Mateus de Jesus Santos, desenvolvedor Full Stack Pleno com foco em front-end Angular e TypeScript e experiência em Java e Spring Boot.',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    themeToggle: 'Tema escuro',
    mainNavigation: 'Navegação principal',
    menu: 'Menu',
    opensInNewTab: '(abre em nova aba)',
  },
  nav: [
    { id: 'about', label: 'Sobre' },
    { id: 'experience', label: 'Experiência' },
    { id: 'projects', label: 'Projetos' },
    { id: 'skills', label: 'Habilidades' },
    { id: 'education', label: 'Formação' },
    { id: 'contact', label: 'Contato' },
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
  },
  about: {
    heading: 'Sobre',
    summary:
      'Desenvolvedor Full Stack Pleno com Bacharelado em Sistemas de Informação, especializado em Front-end com Angular e TypeScript, e experiência complementar em Back-end com Java e Spring Boot. Atuação consolidada no desenvolvimento e manutenção de sistemas web para gestão pública na área da saúde, com foco em componentes escaláveis, gerenciamento de estado complexo e integração com APIs RESTful. Experiência em orientação técnica de desenvolvedores, definição de padrões de código e participação em todo o ciclo de desenvolvimento, do protótipo ao deploy em produção. Combina rigor técnico, código limpo e colaboração constante em equipe para entregar soluções de alto impacto.',
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
          'Implementei funcionalidades críticas de identificação de usuários no sistema de Regulação sob prazo apertado, e desenvolvi scripts SQL em PostgreSQL para correção de dados diretamente em ambiente de produção.',
          'Participei ativamente das esteiras de entrega, com deploys constantes em ambientes de homologação e produção.',
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
          role: 'Funcionalidades críticas de identificação de usuários, sob prazo apertado; scripts SQL de correção de dados.',
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
          'Nx (Monorepo)',
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
    intro: 'Para contato profissional, escreva por e-mail ou LinkedIn.',
    emailLabel: 'E-mail',
  },
  footer: {
    sourceCode: 'Código-fonte deste site',
    license: 'Licença MIT',
  },
  notFound: {
    title: 'Página não encontrada',
    message: 'O endereço que você tentou acessar não existe.',
    backLabel: 'Voltar ao início',
  },
};
