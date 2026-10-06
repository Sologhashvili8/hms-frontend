import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import {
  CreateReservation,
  CreateStaffReservation,
  Reservation,
  StaffReservation
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);

  create(hotelId: number, dto: CreateReservation): Observable<Reservation> {
    return this.http
      .post<ApiResponse<Reservation>>(`${API_BASE_URL}/hotels/${hotelId}/reservations`, dto)
      .pipe(map((res) => res.data));
  }

  getStaffReservations(hotelId: number): Observable<StaffReservation[]> {
    return this.http
      .get<ApiResponse<StaffReservation[]>>(`${API_BASE_URL}/hotels/${hotelId}/reservations/details`)
      .pipe(map((res) => res.data));
  }

  createForGuest(hotelId: number, dto: CreateStaffReservation): Observable<Reservation> {
    return this.http
      .post<ApiResponse<Reservation>>(`${API_BASE_URL}/hotels/${hotelId}/reservations/manual`, dto)
      .pipe(map((res) => res.data));
  }

  delete(hotelId: number, reservationId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/hotels/${hotelId}/reservations/${reservationId}`);
  }
}
