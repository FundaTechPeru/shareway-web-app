import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

export type NoticeTone = 'warning' | 'error' | 'info' | 'neutral';

const DEFAULT_ICONS: Record<NoticeTone, string> = {
  warning: 'schedule',
  error: 'warning',
  info: 'info',
  neutral: 'lock',
};

/**
 * Notice banner from the style guide: amber for time warnings, red for
 * errors, primary soft for information and grey for neutral notes
 * ("Tus datos están protegidos"). The message is projected content.
 */
@Component({
  selector: 'app-notice-banner',
  imports: [MatIconModule],
  template: `
    <mat-icon class="icon" aria-hidden="true">{{ resolvedIcon() }}</mat-icon>
    <div class="body">
      @if (heading()) {
        <p class="heading">{{ heading() }}</p>
      }
      <div class="message"><ng-content /></div>
    </div>
    <ng-content select="[bannerAction]" />
  `,
  styleUrl: './notice-banner.scss',
  host: {
    '[class]': "'tone-' + tone()",
    '[attr.role]': "tone() === 'error' ? 'alert' : 'status'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticeBanner {
  readonly tone = input<NoticeTone>('info');
  readonly heading = input<string>('');
  readonly icon = input<string>('');

  protected readonly resolvedIcon = computed(() => this.icon() || DEFAULT_ICONS[this.tone()]);
}
