import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CreateDriverProfileRequest, DriverProfileResponse} from '../model/driver-profile.model';

/** `/users/me/driver-profile` */
@Injectable({providedIn: 'root'})
export class DriverProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/users/me/driver-profile`;

  /** Turns the passenger into a DRIVER; a new login is needed afterwards. */
  create(request: CreateDriverProfileRequest): Observable<DriverProfileResponse> {
    return this.http.post<DriverProfileResponse>(this.url, request);
  }

  get(): Observable<DriverProfileResponse> {
    return this.http.get<DriverProfileResponse>(this.url);
  }
}
