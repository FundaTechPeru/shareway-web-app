import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ButtonVariant, ButtonVariantDirective} from './button/button-variant';
import {Card} from './card/card';
import {EmptyState} from './empty-state/empty-state';
import {NoticeBanner, NoticeTone} from './notice-banner/notice-banner';
import {StatusChip, StatusTone} from './status-chip/status-chip';

@Component({
  imports: [ButtonVariantDirective, Card, EmptyState, NoticeBanner, StatusChip],
  template: `
    <app-status-chip [label]="label()" [tone]="tone()" [icon]="icon()" />
    <app-notice-banner [tone]="bannerTone()" heading="Tienes 04:32 para responder">
      Responde antes de que expire.
    </app-notice-banner>
    <app-card heading="Tus tarjetas" subheading="Visa">
      <p>Contenido</p>
      <div cardActions><button type="button">Acción</button></div>
    </app-card>
    <app-empty-state icon="lock" heading="Este enlace ya no está disponible" message="Expiró.">
      <button emptyActions type="button">Volver</button>
    </app-empty-state>
    <button type="button" [appButton]="variant()" block>Botón</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly label = signal('Confirmado');
  readonly tone = signal<StatusTone>('success');
  readonly icon = signal<string | undefined>(undefined);
  readonly bannerTone = signal<NoticeTone>('warning');
  readonly variant = signal<ButtonVariant | ''>('');
}

describe('shared components', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {fixture, el, host: fixture.componentInstance};
  }

  it('status chip shows a check only for success unless an icon is given', async () => {
    const {fixture, el, host} = await render();
    const chip = () => el.querySelector('app-status-chip .chip')!;
    expect(chip().classList).toContain('tone-success');
    expect(chip().querySelector('mat-icon')?.textContent).toContain('check');

    host.tone.set('warning');
    host.label.set('En revisión');
    await fixture.whenStable();
    expect(chip().classList).toContain('tone-warning');
    expect(chip().querySelector('mat-icon')).toBeNull();
    expect(chip().textContent).toContain('En revisión');

    host.icon.set('schedule');
    await fixture.whenStable();
    expect(chip().querySelector('mat-icon')?.textContent).toContain('schedule');
  });

  it('notice banner uses alert role only for errors', async () => {
    const {fixture, el, host} = await render();
    const banner = () => el.querySelector('app-notice-banner')!;
    expect(banner().getAttribute('role')).toBe('status');
    expect(banner().classList).toContain('tone-warning');
    expect(banner().textContent).toContain('Tienes 04:32 para responder');

    host.bannerTone.set('error');
    await fixture.whenStable();
    expect(banner().getAttribute('role')).toBe('alert');
    expect(banner().querySelector('mat-icon')?.textContent).toContain('warning');
  });

  it('card renders its heading, content and actions', async () => {
    const {el} = await render();
    const card = el.querySelector('app-card')!;
    expect(card.querySelector('h2')?.textContent).toContain('Tus tarjetas');
    expect(card.textContent).toContain('Visa');
    expect(card.textContent).toContain('Contenido');
    expect(card.querySelector('[cardActions] button')).not.toBeNull();
  });

  it('empty state renders the icon, title, message and actions', async () => {
    const {el} = await render();
    const empty = el.querySelector('app-empty-state')!;
    expect(empty.querySelector('mat-icon')?.textContent).toContain('lock');
    expect(empty.querySelector('h2')?.textContent).toContain('Este enlace ya no está disponible');
    expect(empty.textContent).toContain('Expiró.');
    expect(empty.querySelector('.actions button')).not.toBeNull();
  });

  it('button directive applies the variant classes', async () => {
    const {fixture, el, host} = await render();
    const button = () => el.querySelector('button[block]')!;
    expect(button().classList).toContain('sw-button');
    expect(button().classList).toContain('sw-button--primary');
    expect(button().classList).toContain('sw-button--block');

    host.variant.set('danger');
    await fixture.whenStable();
    expect(button().classList).toContain('sw-button--danger');
    expect(button().classList).not.toContain('sw-button--primary');
  });
});
