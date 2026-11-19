import {ChangeDetectionStrategy, Component, input} from '@angular/core';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/** Small colored label for entity states (approved, pending, rejected...). */
@Component({
  selector: 'app-status-chip',
  template: '<span class="chip" [class]="\'chip tone-\' + tone()">{{ label() }}</span>',
  styleUrl: './status-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChip {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
}
