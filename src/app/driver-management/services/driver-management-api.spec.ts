import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {SILENT_STATUSES} from '../../core/http/error.interceptor';
import {AvailabilityApiService} from './availability-api.service';
import {DriverDocumentsApiService} from './driver-documents-api.service';
import {DriverProfileApiService} from './driver-profile-api.service';
import {VehiclesApiService} from './vehicles-api.service';

describe('Driver Management API services', () => {
  const api = environment.apiBaseUrl;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('DriverProfileApiService', () => {
    it('creates and reads the driver profile', () => {
      const service = TestBed.inject(DriverProfileApiService);
      const body = {
        licenseNumber: 'Q12345678',
        emergencyContact: {name: 'Luis', phone: '987654321', relationship: 'Hermano'},
      };
      service.create(body).subscribe();
      const post = http.expectOne(`${api}/users/me/driver-profile`);
      expect(post.request.method).toBe('POST');
      expect(post.request.body).toEqual(body);
      post.flush({}, {status: 201, statusText: 'Created'});

      service.get().subscribe();
      const get = http.expectOne(`${api}/users/me/driver-profile`);
      expect(get.request.method).toBe('GET');
      get.flush({});
    });
  });

  describe('DriverDocumentsApiService', () => {
    it('uploads a document as multipart form data', () => {
      const file = new File(['%PDF'], 'licencia.pdf', {type: 'application/pdf'});
      TestBed.inject(DriverDocumentsApiService).upload('DRIVERS_LICENSE', file).subscribe();

      const req = http.expectOne(`${api}/drivers/me/documents`);
      expect(req.request.method).toBe('POST');
      const body = req.request.body as FormData;
      expect(body).toBeInstanceOf(FormData);
      expect(body.get('type')).toBe('DRIVERS_LICENSE');
      expect((body.get('file') as File).name).toBe('licencia.pdf');
      expect(req.request.headers.has('Content-Type')).toBe(false);
      req.flush({}, {status: 201, statusText: 'Created'});
    });

    it('lists and gets documents', () => {
      const service = TestBed.inject(DriverDocumentsApiService);
      service.list().subscribe();
      http.expectOne(`${api}/drivers/me/documents`).flush([]);
      service.get('d1').subscribe();
      http.expectOne(`${api}/drivers/me/documents/d1`).flush({});
    });
  });

  describe('VehiclesApiService', () => {
    const vehicle = {
      plate: 'ABC-123',
      brand: 'Toyota',
      model: 'Yaris',
      year: 2020,
      color: 'Gris',
      seats: 4,
    };

    it('creates, lists, gets and updates vehicles', () => {
      const service = TestBed.inject(VehiclesApiService);
      service.create(vehicle).subscribe();
      const post = http.expectOne(`${api}/drivers/me/vehicles`);
      expect(post.request.method).toBe('POST');
      expect(post.request.body).toEqual(vehicle);
      post.flush({id: 'v1', ...vehicle});

      service.list().subscribe();
      http.expectOne(r => r.method === 'GET' && r.url === `${api}/drivers/me/vehicles`).flush([]);

      service.get('v1').subscribe();
      http.expectOne(`${api}/drivers/me/vehicles/v1`).flush({});

      service.update('v1', {...vehicle, color: 'Rojo'}).subscribe();
      const put = http.expectOne(`${api}/drivers/me/vehicles/v1`);
      expect(put.request.method).toBe('PUT');
      expect(put.request.body.color).toBe('Rojo');
      put.flush({});
    });
  });

  describe('AvailabilityApiService', () => {
    it('normalizes times to HH:mm', () => {
      let result = {};
      TestBed.inject(AvailabilityApiService)
        .get()
        .subscribe(a => (result = a));
      http.expectOne(`${api}/drivers/me/availability`).flush({
        slots: [{dayOfWeek: 'MONDAY', startTime: '07:00:00', endTime: '09:30:00'}],
      });
      expect(result).toEqual({
        slots: [{dayOfWeek: 'MONDAY', startTime: '07:00', endTime: '09:30'}],
      });
    });

    it('treats a missing schedule (404) as empty without a snackbar', () => {
      let result = {};
      TestBed.inject(AvailabilityApiService)
        .get()
        .subscribe(a => (result = a));
      const req = http.expectOne(`${api}/drivers/me/availability`);
      expect(req.request.context.get(SILENT_STATUSES)).toEqual([404]);
      req.flush(null, {status: 404, statusText: 'Not Found'});
      expect(result).toEqual({slots: []});
    });

    it('replaces the whole schedule with PUT', () => {
      const body = {slots: [{dayOfWeek: 'FRIDAY' as const, startTime: '18:00', endTime: '20:00'}]};
      TestBed.inject(AvailabilityApiService).replace(body).subscribe();
      const req = http.expectOne(`${api}/drivers/me/availability`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(body);
    });
  });
});
