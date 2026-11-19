import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {provideAppLocale} from '../../../../testing/locale';
import {SettlementsApiService} from '../../../payments/services/settlements-api.service';
import {DocumentResponse, DocumentType} from '../../model/document.model';
import {buildChecklist} from '../../model/verification';
import {DriverDocumentsApiService} from '../../services/driver-documents-api.service';
import {DriverProfileApiService} from '../../services/driver-profile-api.service';
import {VehiclesApiService} from '../../services/vehicles-api.service';
import {DriverHomePage} from './driver-home-page';

const doc = (type: DocumentType, status: DocumentResponse['status']) =>
  ({type, status, uploadedAt: '2026-11-01T00:00:00Z'}) as DocumentResponse;

const vehicle = {
  id: 'v1',
  plate: 'ABC-123',
  brand: 'Kia',
  model: 'Rio',
  year: 2020,
  color: 'Azul',
  seats: 4,
};

describe('buildChecklist', () => {
  it('marks every step with its state', () => {
    const items = buildChecklist(
      [doc('DRIVERS_LICENSE', 'APPROVED'), doc('NATIONAL_ID', 'REJECTED')],
      [],
    );
    expect(items.map(i => i.state)).toEqual(['done', 'rejected', 'missing', 'missing', 'missing']);
  });

  it('is complete with 4 approved documents and a vehicle', () => {
    const docs = (
      ['DRIVERS_LICENSE', 'NATIONAL_ID', 'CRIMINAL_RECORD', 'VEHICLE_REGISTRATION'] as const
    ).map(t => doc(t, 'APPROVED'));
    expect(buildChecklist(docs, [vehicle]).every(i => i.state === 'done')).toBe(true);
  });
});

describe('DriverHomePage', () => {
  async function render(driverStatus: string, documents: DocumentResponse[] | Error) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: DriverProfileApiService,
          useValue: {get: () => of({fullName: 'Carlos', driverStatus})},
        },
        {
          provide: DriverDocumentsApiService,
          useValue: {
            list: () => (documents instanceof Error ? throwError(() => documents) : of(documents)),
          },
        },
        {provide: VehiclesApiService, useValue: {list: () => of([vehicle])}},
        provideAppLocale(),
        {
          provide: SettlementsApiService,
          useValue: {
            summary: () =>
              of({
                totalGross: 50,
                totalCommission: 7.5,
                totalNet: 42.5,
                pendingNet: 10,
                paidNet: 32.5,
              }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(DriverHomePage);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('shows the pending verification checklist', async () => {
    const text = await render('PENDING_VERIFICATION', [doc('DRIVERS_LICENSE', 'PENDING')]);
    expect(text).toContain('Hola, Carlos');
    expect(text).toContain('Verificación pendiente');
    expect(text).toContain('1 de 5 listos');
    expect(text).toContain('En revisión');
  });

  it('shows the verified state', async () => {
    const text = await render('VERIFIED', []);
    expect(text).toContain('Tu cuenta está verificada');
    expect(text.replace(/\s+/g, ' ')).toContain('S/ 42.50');
  });

  it('still renders when a request fails', async () => {
    const text = await render('PENDING_VERIFICATION', new Error('down'));
    expect(text).toContain('Sin subir');
  });
});
