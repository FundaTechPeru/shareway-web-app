import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {VehicleRequest, VehicleResponse} from '../model/vehicle.model';

/** `/drivers/me/vehicles` */
@Injectable({providedIn: 'root'})
export class VehiclesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/drivers/me/vehicles`;

  list(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(this.url);
  }

  get(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.url}/${encodeURIComponent(id)}`);
  }

  create(request: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.url, request);
  }

  update(id: string, request: VehicleRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.url}/${encodeURIComponent(id)}`, request);
  }
}
