import {ChangeDetectionStrategy, Component, booleanAttribute, input} from '@angular/core';

/** ShareWay mark: a route shaped like an "S" with an amber destination dot. */
@Component({
  selector: 'app-brand-logo',
  template: `
    <svg viewBox="0 0 40 40" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
      <rect width="40" height="40" rx="10" [attr.fill]="inverted() ? '#FFFFFF' : '#0F5F73'" />
      <path
        d="M26 11.5h-8.5a4.25 4.25 0 0 0 0 8.5h5a4.25 4.25 0 0 1 0 8.5H14"
        fill="none"
        [attr.stroke]="inverted() ? '#0F5F73' : '#FFFFFF'"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="12.5" cy="28.5" r="2.5" [attr.fill]="inverted() ? '#0F5F73' : '#FFFFFF'" />
      <circle cx="29" cy="10.5" r="3.5" fill="#F2A31B" />
    </svg>
  `,
  styles: ':host { display: inline-flex; flex-shrink: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandLogo {
  readonly size = input(40);
  /** White tile with a primary mark, for dark backgrounds. */
  readonly inverted = input(false, {transform: booleanAttribute});
}
