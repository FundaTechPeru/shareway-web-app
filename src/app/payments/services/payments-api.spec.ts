import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {simulatedCardToken} from '../model/payment.model';
import {PaymentMethodsApiService} from './payment-methods-api.service';
import {PaymentsApiService} from './payments-api.service';
import {SettlementsApiService} from './settlements-api.service';

describe('Payments API services', () => {
  const api = environment.apiBaseUrl;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('builds simulated card tokens', () => {
    expect(simulatedCardToken()).toMatch(/^tok_[0-9a-f-]{36}$/);
    expect(simulatedCardToken(true)).toBe('tok_declined');
  });

  it('lists, creates and deletes payment methods', () => {
    const service = TestBed.inject(PaymentMethodsApiService);
    service.list().subscribe();
    http.expectOne(r => r.method === 'GET' && r.url === `${api}/payment-methods`).flush([]);

    const body = {
      cardToken: 'tok_1',
      brand: 'VISA' as const,
      last4: '4242',
      expMonth: 12,
      expYear: 2030,
    };
    service.create(body).subscribe();
    const post = http.expectOne(r => r.method === 'POST');
    expect(post.request.url).toBe(`${api}/payment-methods`);
    expect(post.request.body).toEqual(body);
    post.flush({id: 'pm1'});

    service.delete('pm1').subscribe();
    const del = http.expectOne(`${api}/payment-methods/pm1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null, {status: 204, statusText: 'No Content'});
  });

  it('reads my payments', () => {
    const service = TestBed.inject(PaymentsApiService);
    service.listMine().subscribe();
    http.expectOne(`${api}/payments/me`).flush([]);
    service.getMine('p1').subscribe();
    http.expectOne(`${api}/payments/me/p1`).flush({});
  });

  it('reads my settlements and the earnings summary', () => {
    const service = TestBed.inject(SettlementsApiService);
    service.listMine().subscribe();
    http.expectOne(`${api}/settlements/me`).flush([]);
    service.getMine('s1').subscribe();
    http.expectOne(`${api}/settlements/me/s1`).flush({});
    service.summary().subscribe();
    http.expectOne(`${api}/settlements/me/summary`).flush({});
  });
});
