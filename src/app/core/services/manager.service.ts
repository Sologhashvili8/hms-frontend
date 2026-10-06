import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ManagerProfile } from '../models/admin.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<ManagerProfile> {
    return this.http
      .get<ApiResponse<ManagerProfile>>(`${API_BASE_URL}/managers/me`)
      .pipe(map((res) => res.data));
  }
}
