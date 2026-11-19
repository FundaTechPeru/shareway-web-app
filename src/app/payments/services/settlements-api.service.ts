import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {EarningsSummaryResponse, SettlementResponse} from '../model/settlement.model';

/** `/settlements/me` (DRIVER) */
@Injectable({providedIn: 'root'})
export class SettlementsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/settlements/me`;

  listMine(): Observable<SettlementResponse[]> {
    return this.http.get<SettlementResponse[]>(this.url);
  }

  getMine(id: string): Observable<SettlementResponse> {
    return this.http.get<SettlementResponse>(`${this.url}/${encodeURIComponent(id)}`);
  }

  summary(): Observable<EarningsSummaryResponse> {
    return this.http.get<EarningsSummaryResponse>(`${this.url}/summary`);
  }
}
