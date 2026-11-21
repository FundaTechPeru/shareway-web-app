import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

export type EmptyStateTone = 'neutral' | 'error';

/**
 * Centered empty, expired or error state (modeled on EME-03 and CON-E4):
 * a grey circle with the icon, a bold title, a short message and actions in
 * an element with `emptyActions`.
 */
@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <span class="bubble" aria-hidden="true">
      <mat-icon>{{ icon() }}</mat-icon>
    </span>
    <h2 class="heading">{{ heading() }}</h2>
    @if (message()) {
      <p class="message">{{ message() }}</p>
    }
    <ng-content />
    <div class="actions"><ng-content select="[emptyActions]" /></div>
  `,
  styleUrl: './empty-state.scss',
  host: {'[class]': "'tone-' + tone()"},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input<string>('inbox');
  readonly heading = input.required<string>();
  readonly message = input<string>('');
  readonly tone = input<EmptyStateTone>('neutral');
}
