import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File): Observable<string> {
    const body = new FormData();
    body.append('file', file);

    return this.http
      .post<ApiResponse<{ url: string }>>(`${API_BASE_URL}/uploads/images`, body)
      .pipe(map((res) => res.data.url));
  }
}
