import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PaymentResponse} from '../model/payment.model';

/** `/payments/me` (PASSENGER) */
@Injectable({providedIn: 'root'})
export class PaymentsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/payments/me`;

  listMine(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(this.url);
  }

  getMine(id: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
