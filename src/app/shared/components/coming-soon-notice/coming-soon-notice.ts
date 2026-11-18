import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/** Inline notice for a flow that waits on a backend change. */
@Component({
  selector: 'app-coming-soon-notice',
  imports: [MatIconModule],
  template: `
    <div class="notice" role="status">
      <mat-icon aria-hidden="true">schedule</mat-icon>
      <div>
        <strong>Disponible próximamente</strong>
        <p>{{ message() }}</p>
      </div>
    </div>
  `,
  styles: `
    .notice {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface);
    }
    mat-icon {
      color: var(--mat-sys-primary);
      flex-shrink: 0;
    }
    p {
      margin: 4px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonNotice {
  readonly message = input.required<string>();
}
