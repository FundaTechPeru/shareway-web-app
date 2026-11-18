import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup} from '@angular/forms';
import {of} from 'rxjs';
import {NotificationService} from '../../../core/notifications/notification.service';
import {PaymentMethodsApiService} from '../../services/payment-methods-api.service';
import {PaymentMethodsPage, notExpiredValidator} from './payment-methods-page';

describe('notExpiredValidator', () => {
  const now = new Date(2026, 10, 18); // November 2026
  const check = (expMonth: number, expYear: number) =>
    notExpiredValidator(
      new FormGroup({expMonth: new FormControl(expMonth), expYear: new FormControl(expYear)}),
      now,
    );

  it('accepts the current month and later', () => {
    expect(check(11, 2026)).toBeNull();
    expect(check(1, 2027)).toBeNull();
  });

  it('rejects past months', () => {
    expect(check(10, 2026)).toEqual({expired: true});
    expect(check(12, 2025)).toEqual({expired: true});
  });
});

describe('PaymentMethodsPage', () => {
  let fixture: ComponentFixture<PaymentMethodsPage>;
  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  const visa = {id: 'pm1', brand: 'VISA', last4: '4242', expMonth: 12, expYear: 2030};

  beforeEach(async () => {
    api = {list: vi.fn(() => of([visa])), create: vi.fn(), delete: vi.fn(() => of(undefined))};
    TestBed.configureTestingModule({
      providers: [
        {provide: PaymentMethodsApiService, useValue: api},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    fixture = TestBed.createComponent(PaymentMethodsPage);
    await fixture.whenStable();
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('lists the saved cards', () => {
    expect(text()).toContain('Visa •••• 4242');
    expect(text()).toContain('Vence 12/2030');
  });

  it('adds a card with a simulated token and never asks for the full number', async () => {
    api.create.mockReturnValue(
      of({id: 'pm2', brand: 'AMEX', last4: '0005', expMonth: 1, expYear: 2031}),
    );
    const page = fixture.componentInstance;
    page.form.setValue({
      brand: 'AMEX',
      last4: '0005',
      expMonth: 1,
      expYear: 2031,
      simulateDecline: false,
    });
    page.save();
    await fixture.whenStable();

    const request = api.create.mock.calls[0][0];
    expect(request.cardToken).toMatch(/^tok_[0-9a-f-]{36}$/);
    expect(request).toEqual(expect.objectContaining({brand: 'AMEX', last4: '0005'}));
    expect(Object.keys(request)).not.toContain('cardNumber');
    expect(text()).toContain('American Express •••• 0005');
  });

  it('sends tok_declined when simulating a declined card', () => {
    api.create.mockReturnValue(of(visa));
    const page = fixture.componentInstance;
    page.form.setValue({
      brand: 'VISA',
      last4: '1111',
      expMonth: 12,
      expYear: 2030,
      simulateDecline: true,
    });
    page.save();
    expect(api.create.mock.calls[0][0].cardToken).toBe('tok_declined');
  });

  it('does not save invalid digits', () => {
    const page = fixture.componentInstance;
    page.form.setValue({
      brand: 'VISA',
      last4: '12a4',
      expMonth: 12,
      expYear: 2030,
      simulateDecline: false,
    });
    page.save();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('deletes a card after confirming', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const deleteButton = Array.from(el.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Eliminar'),
    )!;
    deleteButton.click();
    await fixture.whenStable();
    expect(text()).toContain('¿Eliminar esta tarjeta?');

    const confirm = Array.from(el.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Sí, eliminar'),
    )!;
    confirm.click();
    await fixture.whenStable();

    expect(api.delete).toHaveBeenCalledWith('pm1');
    expect(text()).toContain('Aún no registraste ninguna tarjeta.');
  });
});
