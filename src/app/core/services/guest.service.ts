import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { Guest, UpdateGuest } from '../models/guest.model';
import { MyReservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/guests`;

  getMe(): Observable<Guest> {
    return this.http.get<ApiResponse<Guest>>(`${this.baseUrl}/me`).pipe(map((res) => res.data));
  }

  updateMe(dto: UpdateGuest): Observable<Guest> {
    return this.http
      .put<ApiResponse<Guest>>(`${this.baseUrl}/me`, dto)
      .pipe(map((res) => res.data));
  }

  getMyReservations(): Observable<MyReservation[]> {
    return this.http
      .get<ApiResponse<MyReservation[]>>(`${this.baseUrl}/me/reservations`)
      .pipe(map((res) => res.data));
  }
}
