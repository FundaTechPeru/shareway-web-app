import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';

/**
 * Placeholder page for screens that are not built yet. The title comes from
 * the route `data` through component input binding.
 */
@Component({
  selector: 'app-coming-soon-page',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './coming-soon-page.html',
  styleUrl: './coming-soon-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPage {
  readonly title = input('ShareWay');
}
