import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/**
 * Status tones from the style guide:
 * success (Confirmado), warning (En revisión), error (Rechazado),
 * neutral (Conductor nuevo) and info (primary soft, for neutral progress).
 */
export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/** Small pill with the state of an entity (approved, pending, rejected...). */
@Component({
  selector: 'app-status-chip',
  imports: [MatIconModule],
  template: `
    <span class="chip" [class]="'chip tone-' + tone()">
      @if (resolvedIcon(); as name) {
        <mat-icon aria-hidden="true">{{ name }}</mat-icon>
      }
      {{ label() }}
    </span>
  `,
  styleUrl: './status-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChip {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
  /** Leading icon. Success shows a check by default, as in the guide; pass '' to hide it. */
  readonly icon = input<string | undefined>(undefined);

  protected readonly resolvedIcon = computed(() => {
    const icon = this.icon();
    if (icon !== undefined) {
      return icon;
    }
    return this.tone() === 'success' ? 'check' : '';
  });
}
