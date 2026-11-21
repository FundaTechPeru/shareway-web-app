import {ChangeDetectionStrategy, Component, input} from '@angular/core';

/**
 * White card with a 16 px radius and a light border (style guide).
 * Optional heading and subheading. Header actions go in an element with
 * `cardHeaderAction`; bottom actions in an element with `cardActions`.
 * Add the `sw-card--list` class when the body is a `.sw-list`.
 */
@Component({
  selector: 'app-card',
  template: `
    <ng-content select="mat-progress-bar" />
    @if (heading() || subheading()) {
      <header class="header">
        <div class="titles">
          @if (heading()) {
            <h2 class="heading">{{ heading() }}</h2>
          }
          @if (subheading()) {
            <p class="subheading">{{ subheading() }}</p>
          }
        </div>
        <ng-content select="[cardHeaderAction]" />
      </header>
    }
    <ng-content />
    <ng-content select="[cardActions]" />
  `,
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly heading = input<string>('');
  readonly subheading = input<string>('');
}
