import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DocumentResponse, DocumentType} from '../model/document.model';

/** `/drivers/me/documents` */
@Injectable({providedIn: 'root'})
export class DriverDocumentsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/drivers/me/documents`;

  /**
   * Multipart upload with a `type` form field and a `file` part. The browser
   * sets the multipart boundary, so no Content-Type header is added here.
   */
  upload(type: DocumentType, file: File): Observable<DocumentResponse> {
    const body = new FormData();
    body.append('type', type);
    body.append('file', file, file.name);
    return this.http.post<DocumentResponse>(this.url, body);
  }

  list(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(this.url);
  }

  get(id: string): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
