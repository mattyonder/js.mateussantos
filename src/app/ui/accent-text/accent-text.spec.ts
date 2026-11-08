import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AccentText, splitAccent } from './accent-text';

@Component({
  imports: [AccentText],
  template: `<h2><app-accent-text [text]="text()" [accent]="accent()" /></h2>`,
})
class Host {
  readonly text = signal('Professional experience');
  readonly accent = signal<string | undefined>('experience');
}

describe('splitAccent', () => {
  it('splits around the accent', () => {
    expect(splitAccent('Sobre mim', 'mim')).toEqual({ before: 'Sobre ', accent: 'mim', after: '' });
    expect(splitAccent('Mateus de Jesus Santos', 'de Jesus')).toEqual({
      before: 'Mateus ',
      accent: 'de Jesus',
      after: ' Santos',
    });
  });

  it('uses the FIRST occurrence only', () => {
    expect(splitAccent('a b a', 'a')).toEqual({ before: '', accent: 'a', after: ' b a' });
  });

  it('never hides text: a missing or unknown accent returns everything as plain text', () => {
    expect(splitAccent('Sobre mim', undefined)).toEqual({
      before: 'Sobre mim',
      accent: '',
      after: '',
    });
    expect(splitAccent('Sobre mim', '')).toEqual({ before: 'Sobre mim', accent: '', after: '' });
    expect(splitAccent('Sobre mim', 'xyz')).toEqual({ before: 'Sobre mim', accent: '', after: '' });
  });

  it('always reassembles to the original text', () => {
    for (const [text, accent] of [
      ['Habilidades técnicas', 'técnicas'],
      ["Let's talk", 'talk'],
      ['Formação e idiomas', 'idiomas'],
      ['No match here', 'zzz'],
    ] as const) {
      const { before, accent: part, after } = splitAccent(text, accent);
      expect(before + part + after).toBe(text);
    }
  });
});

describe('AccentText', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const heading = (fixture.nativeElement as HTMLElement).querySelector('h2') as HTMLElement;
    return { fixture, heading };
  }

  it('keeps the heading text exactly the same (screen readers read one unbroken string)', () => {
    const { heading } = setup();
    expect(heading.textContent).toBe('Professional experience');
  });

  it('wraps only the accent in a plain span, never in <em> or <strong>', () => {
    const { heading } = setup();
    const spans = heading.querySelectorAll('span.accent');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('experience');
    expect(heading.querySelector('em, strong, i, b')).toBeNull();
  });

  it('renders no span at all without an accent', () => {
    const { fixture, heading } = setup();
    fixture.componentInstance.accent.set(undefined);
    fixture.detectChanges();
    expect(heading.querySelector('.accent')).toBeNull();
    expect(heading.textContent).toBe('Professional experience');
  });

  it('follows the text when the language changes', () => {
    const { fixture, heading } = setup();
    fixture.componentInstance.text.set('Experiência profissional');
    fixture.componentInstance.accent.set('profissional');
    fixture.detectChanges();
    expect(heading.textContent).toBe('Experiência profissional');
    expect(heading.querySelector('.accent')?.textContent).toBe('profissional');
  });
});
