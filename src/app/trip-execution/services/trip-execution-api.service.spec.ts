import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {Trip} from '../model/trip.model';
import {
  TripExecutionApiService,
  toBoardingOutcome,
  toTripStatus,
} from './trip-execution-api.service';

describe('TripExecutionApiService', () => {
  const url = `${environment.apiBaseUrl}/trips`;
  let http: HttpTestingController;
  let service: TripExecutionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TripExecutionApiService);
  });

  afterEach(() => http.verify());

  it('maps the Spanish trip to the English model', () => {
    let trip: Trip | undefined;
    service.get('t-1').subscribe(t => (trip = t));
    http.expectOne(`${url}/t-1`).flush({
      id: 't-1',
      grupoId: 'g-1',
      conductorId: 'd-1',
      estado: 'PROGRAMADO',
      inicioReal: null,
      finReal: null,
      abordajes: [
        {
          reservaId: 'b-1',
          pasajeroId: 'p-1',
          abordo: false,
          abordadoEn: null,
          intentosFallidos: 1,
          bloqueado: false,
        },
      ],
    });
    expect(trip).toEqual({
      id: 't-1',
      groupId: 'g-1',
      driverId: 'd-1',
      status: 'SCHEDULED',
      rawStatus: 'PROGRAMADO',
      startedAt: null,
      finishedAt: null,
      boardings: [
        {
          bookingId: 'b-1',
          passengerId: 'p-1',
          boarded: false,
          boardedAt: null,
          failedAttempts: 1,
          locked: false,
        },
      ],
    });
  });

  it('sends the boarding validation in Spanish and maps the result', () => {
    let outcome = '';
    service
      .validateBoarding('t-1', {driverId: 'd-1', bookingId: 'b-1', code: '1234', method: 'PIN'})
      .subscribe(r => (outcome = `${r.outcome}/${r.remainingAttempts}`));
    const req = http.expectOne(`${url}/t-1/abordajes`);
    expect(req.request.body).toEqual({
      conductorId: 'd-1',
      reservaId: 'b-1',
      codigo: '1234',
      metodo: 'PIN',
    });
    req.flush({resultado: 'INVALIDO', intentosFallidos: 1, intentosRestantes: 2});
    expect(outcome).toBe('INVALID/2');
  });

  it('starts, finishes and cancels a trip', () => {
    service.start('t-1', 'd-1').subscribe();
    expect(http.expectOne(`${url}/t-1/iniciar`).request.body).toEqual({conductorId: 'd-1'});
    service.finish('t-1', 'd-1').subscribe();
    expect(http.expectOne(`${url}/t-1/finalizar`).request.body).toEqual({conductorId: 'd-1'});
    service.cancel('t-1', 'Vehículo averiado').subscribe();
    expect(http.expectOne(`${url}/t-1/cancelar`).request.body).toEqual({
      motivo: 'Vehículo averiado',
    });
  });

  it('maps known statuses and results', () => {
    expect(toTripStatus('EN_CURSO')).toBe('IN_PROGRESS');
    expect(toTripStatus('finalizado')).toBe('COMPLETED');
    expect(toTripStatus('OTRO')).toBe('UNKNOWN');
    expect(toBoardingOutcome('VALIDO')).toBe('VALID');
    expect(toBoardingOutcome('BLOQUEADO')).toBe('LOCKED');
    expect(toBoardingOutcome('INVALIDO')).toBe('INVALID');
  });
});
