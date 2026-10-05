import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { Amenity } from '../models/amenity.model';

@Injectable({ providedIn: 'root' })
export class AmenityService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Amenity[]> {
    return this.http
      .get<ApiResponse<Amenity[]>>(`${API_BASE_URL}/amenities`)
      .pipe(map((res) => res.data));
  }
}
