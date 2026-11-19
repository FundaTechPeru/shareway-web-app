import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {provideAppLocale} from '../../../../testing/locale';
import {SettlementResponse} from '../../model/settlement.model';
import {SettlementsApiService} from '../../services/settlements-api.service';
import {SettlementDetailPage} from '../settlement-detail-page/settlement-detail-page';
import {EarningsPage} from './earnings-page';

const settlement = (partial: Partial<SettlementResponse>): SettlementResponse => ({
  id: 's1',
  tripId: 't1',
  driverId: 'u1',
  grossAmount: 30,
  commissionAmount: 4.5,
  netAmount: 25.5,
  currency: 'PEN',
  status: 'PENDING',
  tripCompletedAt: '2026-11-01T10:00:00Z',
  createdAt: '2026-11-01T10:05:00Z',
  paidAt: null,
  ...partial,
});

const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\s+/g, ' ');

describe('EarningsPage', () => {
  async function render(api: Partial<Record<keyof SettlementsApiService, unknown>>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: SettlementsApiService, useValue: api},
      ],
    });
    const fixture = TestBed.createComponent(EarningsPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the summary and the settlements, newest first', async () => {
    const el = await render({
      summary: () =>
        of({totalGross: 60, totalCommission: 9, totalNet: 51, pendingNet: 25.5, paidNet: 25.5}),
      listMine: () =>
        of([
          settlement({id: 'old', status: 'PAID', tripCompletedAt: '2026-10-01T10:00:00Z'}),
          settlement({id: 'new'}),
        ]),
    });
    expect(text(el.querySelector('[data-testid=summary]')!)).toContain('S/ 51.00');
    const rows = el.querySelectorAll('[data-id]');
    expect(rows[0].getAttribute('data-id')).toBe('new');
    expect(text(rows[0] as HTMLElement)).toContain('Pendiente de pago');
    expect(text(rows[1] as HTMLElement)).toContain('Pagado');
  });

  it('still lists settlements when the summary fails', async () => {
    const el = await render({
      summary: () => throwError(() => new Error('down')),
      listMine: () => of([settlement({})]),
    });
    expect(el.querySelector('[data-testid=summary]')).toBeNull();
    expect(text(el)).toContain('S/ 25.50');
  });

  it('shows an empty state', async () => {
    const el = await render({summary: () => of(null), listMine: () => of([])});
    expect(text(el)).toContain('Aún no tienes liquidaciones');
  });
});

describe('SettlementDetailPage', () => {
  it('loads the settlement by id and shows its breakdown', async () => {
    const getMine = vi.fn(() => of(settlement({status: 'PAID', paidAt: '2026-11-05T10:00:00Z'})));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: SettlementsApiService, useValue: {getMine}},
      ],
    });
    const fixture = TestBed.createComponent(SettlementDetailPage);
    fixture.componentRef.setInput('id', 's1');
    await fixture.whenStable();

    expect(getMine).toHaveBeenCalledWith('s1');
    const content = text(fixture.nativeElement as HTMLElement);
    expect(content).toContain('S/ 30.00');
    expect(content).toContain('S/ 4.50');
    expect(content).toContain('S/ 25.50');
    expect(content).toContain('Pagado');
  });
});
