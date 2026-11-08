/**
 * Shape of the per-language content files. PT and EN both implement
 * `SiteContent`, so a missing key in either language is a compile error.
 *
 * Rules (see CLAUDE.md): no facts beyond the résumé; the health-sector systems
 * are listed with role and stack only; personal projects stay placeholders
 * until real ones exist.
 */

export type SectionId = 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact';

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Alt text of the Open Graph / Twitter share image. */
  readonly imageAlt: string;
}

export interface NavItem {
  readonly id: SectionId;
  readonly label: string;
  /** Small label in the numbered section header ("02 ── Career"). Adds meaning, does not repeat the h2. */
  readonly eyebrow: string;
}

/** A short, scannable card in the About section. Text must be a fragment of the résumé. */
export interface Highlight {
  readonly title: string;
  readonly text: string;
}

export interface Position {
  readonly role: string;
  readonly company: string;
  readonly period: string;
  /** True for the position the owner holds today. */
  readonly current: boolean;
  readonly highlights: readonly string[];
}

export interface SkillGroup {
  readonly id: 'technical' | 'tools' | 'methodologies' | 'interpersonal';
  readonly title: string;
  readonly items: readonly string[];
}

export interface Degree {
  readonly title: string;
  readonly institution: string;
  readonly period: string;
}

export interface SpokenLanguage {
  readonly name: string;
  readonly level: string;
}

/** A system the owner worked on. Role and stack only: nothing internal. */
export interface WorkedSystem {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly stack: readonly string[];
}

/** Placeholder slot. Intentionally has NO name, description or stack. */
export interface ComingSoonProject {
  readonly status: 'coming-soon';
}

/** A real personal project. Replace a placeholder with this to publish one. */
export interface PublishedProject {
  readonly status: 'published';
  readonly name: string;
  readonly description: string;
  readonly stack: readonly string[];
  readonly url?: string;
  readonly repositoryUrl?: string;
}

export type PersonalProject = ComingSoonProject | PublishedProject;

export interface SiteContent {
  readonly meta: PageMeta;
  readonly a11y: {
    readonly skipToContent: string;
    readonly themeToggle: string;
    readonly mainNavigation: string;
    /** Name of the button that opens/closes the navigation on small screens. */
    readonly menu: string;
    /** Announced after the text of links that open in a new tab. */
    readonly opensInNewTab: string;
  };
  readonly nav: readonly NavItem[];
  readonly hero: {
    readonly name: string;
    readonly role: string;
    readonly tagline: string;
    readonly location: string;
    readonly photoAlt: string;
    readonly resumeLabel: string;
    readonly contactLabel: string;
    readonly profilesLabel: string;
    /** Accessible name of the technology chips under the tagline. */
    readonly stackLabel: string;
  };
  readonly about: {
    readonly heading: string;
    readonly summary: string;
    readonly highlights: readonly Highlight[];
  };
  readonly experience: {
    readonly heading: string;
    readonly positions: readonly Position[];
  };
  readonly projects: {
    readonly heading: string;
    readonly worked: {
      readonly heading: string;
      readonly note: string;
      readonly systems: readonly WorkedSystem[];
      readonly roleLabel: string;
      readonly stackLabel: string;
    };
    readonly personal: {
      readonly heading: string;
      readonly comingSoonLabel: string;
      readonly githubLabel: string;
      readonly items: readonly PersonalProject[];
    };
  };
  readonly skills: {
    readonly heading: string;
    readonly groups: readonly SkillGroup[];
  };
  readonly education: {
    readonly heading: string;
    readonly degreesHeading: string;
    readonly degrees: readonly Degree[];
    readonly languagesHeading: string;
    readonly languages: readonly SpokenLanguage[];
  };
  readonly contact: {
    readonly heading: string;
    /** Professional statement of availability for conversations (owner's decision, Contact only). */
    readonly intro: string;
    readonly emailLabel: string;
    readonly emailCta: string;
  };
  readonly footer: {
    readonly sourceCode: string;
    readonly license: string;
    readonly backToTop: string;
  };
  readonly notFound: {
    readonly title: string;
    readonly message: string;
    readonly backLabel: string;
  };
}
