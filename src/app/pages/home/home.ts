import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';
import { MAIN_CONTENT_ID, SkipLink } from '../../layout/skip-link/skip-link';
import { About } from '../../sections/about/about';
import { Contact } from '../../sections/contact/contact';
import { Education } from '../../sections/education/education';
import { Experience } from '../../sections/experience/experience';
import { Hero } from '../../sections/hero/hero';
import { Projects } from '../../sections/projects/projects';
import { Skills } from '../../sections/skills/skills';
import { Stats } from '../../sections/stats/stats';

/**
 * The single page, served at `/pt` and `/en`. The router reuses this component
 * when only the language changes, so switching language updates the text in
 * place and the scroll position is kept.
 */
@Component({
  selector: 'app-home',
  imports: [
    SkipLink,
    Header,
    Hero,
    Stats,
    About,
    Experience,
    Projects,
    Skills,
    Education,
    Contact,
    Footer,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly mainId = MAIN_CONTENT_ID;
}
