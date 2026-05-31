import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

type UploadResponse = {
  url: string;
};

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly uploadProductUrl = `${environment.baseUrl}/upload/upload-product`;

  constructor(private readonly httpClient: HttpClient) {}

  uploadProduct(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('accessToken');
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : undefined;

    return this.httpClient.post<UploadResponse>(
      this.uploadProductUrl,
      formData,
      { headers },
    );
  }
}
