import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {provideAppLocale} from '../../../../testing/locale';
import {PaymentResponse} from '../../model/payment.model';
import {PaymentsApiService} from '../../services/payments-api.service';
import {PaymentsPage, paymentDate} from './payments-page';

function payment(partial: Partial<PaymentResponse>): PaymentResponse {
  return {
    id: 'p1',
    bookingId: 'b1',
    passengerId: 'u1',
    paymentMethodId: 'pm1',
    status: 'CAPTURED',
    authorizedAmount: 12.5,
    capturedAmount: 12.5,
    currency: 'PEN',
    providerRef: 'sim_1',
    authorizedAt: '2026-11-01T10:00:00Z',
    capturedAt: '2026-11-01T11:00:00Z',
    voidedAt: null,
    ...partial,
  };
}

describe('PaymentsPage', () => {
  it('uses the latest relevant date of a payment', () => {
    expect(paymentDate(payment({}))).toBe('2026-11-01T11:00:00Z');
    expect(paymentDate(payment({capturedAt: null}))).toBe('2026-11-01T10:00:00Z');
  });

  it('lists payments newest first with amount in PEN and status', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideAppLocale(),
        {
          provide: PaymentsApiService,
          useValue: {
            listMine: () =>
              of([
                payment({id: 'old', capturedAt: '2026-10-01T00:00:00Z', capturedAmount: 8}),
                payment({
                  id: 'new',
                  status: 'AUTHORIZED',
                  capturedAt: null,
                  capturedAmount: null,
                  authorizedAmount: 20,
                  authorizedAt: '2026-11-10T00:00:00Z',
                }),
              ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PaymentsPage);
    await fixture.whenStable();
    const panels = (fixture.nativeElement as HTMLElement).querySelectorAll('mat-expansion-panel');

    expect(panels[0].getAttribute('data-id')).toBe('new');
    expect(panels[0].textContent?.replace(/\s+/g, ' ')).toContain('S/ 20.00');
    expect(panels[0].textContent).toContain('Autorizado');
    expect(panels[1].textContent).toContain('Cobrado');
  });

  it('shows an empty state', async () => {
    TestBed.configureTestingModule({
      providers: [{provide: PaymentsApiService, useValue: {listMine: () => of([])}}],
    });
    const fixture = TestBed.createComponent(PaymentsPage);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Aún no tienes pagos registrados.',
    );
  });
});
