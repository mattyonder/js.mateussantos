import type { SiteContent } from './types';

/**
 * EN content. Source of truth: the owner's own English résumé
 * (`public/curriculo_mateus_de_jesus_santos_en.pdf`). Deliberately NOT
 * re-translated from PT: the owner chose to keep the EN résumé wording.
 * Known differences from PT (also from that résumé): "RxJS" is listed under
 * technical skills, and the summary is shorter.
 */
export const EN: SiteContent = {
  meta: {
    title: 'Mateus de Jesus Santos | Mid-Level Full Stack Developer (Angular)',
    description:
      'Portfolio of Mateus de Jesus Santos, a mid-level Full Stack developer specialized in Angular and TypeScript front-end, with Java and Spring Boot experience.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    themeToggle: 'Dark theme',
    mainNavigation: 'Main navigation',
  },
  nav: [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ],
  hero: {
    name: 'Mateus de Jesus Santos',
    role: 'Mid-Level Full Stack Developer | Front-end Angular Specialist',
    tagline:
      'Front-end developer with Angular and TypeScript, with back-end experience in Java and Spring Boot.',
    location: 'Sergipe, Brazil',
    photoAlt: 'Photo of Mateus de Jesus Santos',
    resumeLabel: 'Download resume',
    contactLabel: 'Contact',
    profilesLabel: 'Professional profiles',
  },
  about: {
    heading: 'About',
    summary:
      "Mid-level Full Stack Developer with a Bachelor's degree in Information Systems, specialized in Front-end development with Angular and TypeScript, and hands-on experience in Back-end development with Java and Spring Boot. Solid track record building and maintaining web applications for public healthcare management. Experienced in mentoring developers, defining coding standards, and participating in the full development lifecycle, from prototyping to production deployment. Combines technical rigor, clean code practices, and strong team collaboration to deliver high-impact solutions.",
  },
  experience: {
    heading: 'Experience',
    positions: [
      {
        role: 'Mid-Level Full Stack Developer',
        company: 'MMS Soluções e Consultoria',
        period: 'June 2026 – Present',
        current: true,
        highlights: [
          'Evolve the architecture of the SISPEC Nx monorepo, having created the Emergency and Urgent Care module and refactored the library shared across modules, while establishing coding standards and technical validation checklists for Pull Requests.',
          "Serve as the team's technical reference, guiding developers on healthcare domain business rules, critical code review, and unblocking complex tasks.",
          'Develop and evolve interfaces in Angular and RxJS, focusing on scalable components, complex state management for medical care dashboards, and responsive styling for healthcare professionals.',
          'Contribute to the back-end with Java and Spring Boot, implementing targeted changes and actively participating in staging and production deployments for government public healthcare systems.',
          'Introduce automated testing with Jest on my own initiative across the SISPEC system, covering the Primary Care and Emergency and Urgent Care modules and the shared library, creating a safety net to validate features, including those developed with AI tooling support.',
        ],
      },
      {
        role: 'Junior Full Stack Developer',
        company: 'MMS Soluções e Consultoria',
        period: 'November 2024 – June 2026',
        current: false,
        highlights: [
          'Led front-end development of the SISPEC system, defining development standards, structuring PR validation checklists, and mentoring interns and new developers on business rules and best practices with Angular, RxJS, and SASS.',
          "Developed most of the interfaces for the Almoxarifado (Inventory Management) system and served as the sole front-end developer for IPE Saúde's medical priority panel, focusing on modularization and reusable components.",
          'Built secure RESTful APIs in Java and Spring Boot and resolved critical bugs for the Almoxarifado and SISPEC projects, maintaining clean code standards.',
          'Implemented critical user identification features in the Regulação (Regulation) system under tight deadlines, and developed SQL scripts (PostgreSQL) for data correction directly in production environments.',
          'Actively participated in delivery pipelines, with frequent deployments to staging and production environments.',
        ],
      },
    ],
  },
  projects: {
    heading: 'Projects',
    worked: {
      heading: 'Systems I worked on',
      note: 'Government public healthcare systems: for that reason, I do not show screens, data or internal details.',
      roleLabel: 'Role',
      stackLabel: 'Technologies',
      systems: [
        {
          id: 'sispec',
          name: 'SISPEC',
          role: 'Led front-end development and evolved the Nx monorepo architecture; created the Emergency and Urgent Care module; introduced automated testing with Jest.',
          stack: ['Angular', 'RxJS', 'SASS', 'Nx', 'Jest', 'Java', 'Spring Boot'],
        },
        {
          id: 'almoxarifado',
          name: 'Almoxarifado (Inventory Management)',
          role: 'Developed most of the interfaces; built RESTful APIs and resolved critical bugs.',
          stack: ['Angular', 'Java', 'Spring Boot'],
        },
        {
          id: 'ipe-saude',
          name: 'IPE Saúde medical priority panel',
          role: 'Sole front-end developer, focusing on modularization and reusable components.',
          stack: ['Angular'],
        },
        {
          id: 'regulacao',
          name: 'Regulação (Regulation)',
          role: 'Implemented critical user identification features under tight deadlines; wrote SQL data-correction scripts.',
          stack: ['PostgreSQL', 'SQL'],
        },
      ],
    },
    personal: {
      heading: 'Personal projects: coming soon',
      comingSoonLabel: 'Coming soon',
      githubLabel: 'See my GitHub',
      items: [{ status: 'coming-soon' }, { status: 'coming-soon' }, { status: 'coming-soon' }],
    },
  },
  skills: {
    heading: 'Skills',
    groups: [
      {
        id: 'technical',
        title: 'Technical',
        items: [
          'Angular',
          'TypeScript',
          'JavaScript',
          'RxJS',
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
        title: 'Tools',
        items: [
          'Git',
          'GitHub',
          'GitHub Actions',
          'Docker',
          'VSCode',
          'IntelliJ',
          'DBeaver',
          'Figma (layout reading)',
        ],
      },
      { id: 'methodologies', title: 'Methodologies', items: ['Scrum'] },
      {
        id: 'interpersonal',
        title: 'Soft Skills',
        items: [
          'Technical mentoring',
          'Communication with business stakeholders',
          'Problem-solving under deadlines',
          'Cross-functional collaboration',
        ],
      },
    ],
  },
  education: {
    heading: 'Education and languages',
    degrees: [
      {
        title: "Bachelor's Degree in Information Systems",
        institution: 'Instituto Federal de Sergipe – Lagarto Campus',
        period: 'March 2022 – June 2026',
      },
      {
        title: 'Technical Certificate in Systems Development',
        institution: 'Instituto Federal de Sergipe – Tobias Barreto Campus',
        period: 'March 2019 – January 2022',
      },
    ],
    languagesHeading: 'Languages',
    languages: [
      { name: 'Portuguese', level: 'Native' },
      { name: 'English', level: 'Intermediate' },
      { name: 'Spanish', level: 'Basic' },
    ],
  },
  contact: {
    heading: 'Contact',
    intro: 'For professional contact, reach out by email or LinkedIn.',
    emailLabel: 'Email',
  },
  footer: {
    sourceCode: 'Source code of this site',
    license: 'MIT License',
  },
  notFound: {
    title: 'Page not found',
    message: 'The address you tried to open does not exist.',
    backLabel: 'Back to start',
  },
};
