import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PaymentMethodResponse, RegisterPaymentMethodRequest} from '../model/payment.model';

/** `/payment-methods` (PASSENGER) */
@Injectable({providedIn: 'root'})
export class PaymentMethodsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/payment-methods`;

  list(): Observable<PaymentMethodResponse[]> {
    return this.http.get<PaymentMethodResponse[]>(this.url);
  }

  create(request: RegisterPaymentMethodRequest): Observable<PaymentMethodResponse> {
    return this.http.post<PaymentMethodResponse>(this.url, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
