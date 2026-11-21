import {Directive, booleanAttribute, input} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'soft';

/**
 * Button variants from the style guide, applied on top of a Material button:
 *   <button mat-flat-button appButton>Principal</button>
 *   <button mat-stroked-button appButton="secondary">Secundario</button>
 *   <button mat-stroked-button appButton="danger">Peligro</button>
 *   <button mat-flat-button appButton="soft">Suave</button>
 * `block` makes it full width and 52 px tall.
 */
@Directive({
  selector: '[appButton]',
  host: {
    class: 'sw-button',
    '[class.sw-button--primary]': "variant() === 'primary'",
    '[class.sw-button--secondary]': "variant() === 'secondary'",
    '[class.sw-button--danger]': "variant() === 'danger'",
    '[class.sw-button--soft]': "variant() === 'soft'",
    '[class.sw-button--block]': 'block()',
  },
})
export class ButtonVariantDirective {
  readonly variant = input<ButtonVariant, ButtonVariant | ''>('primary', {
    alias: 'appButton',
    transform: (value: ButtonVariant | '') => value || 'primary',
  });
  readonly block = input(false, {transform: booleanAttribute});
}
