import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AdminHotel, AdminUser, ManagerProfile } from '../models/admin.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(`${API_BASE_URL}/admin/users`)
      .pipe(map((res) => res.data));
  }

  getHotels(): Observable<AdminHotel[]> {
    return this.http
      .get<ApiResponse<AdminHotel[]>>(`${API_BASE_URL}/admin/hotels`)
      .pipe(map((res) => res.data));
  }

  assignManager(hotelId: number, userId: string): Observable<ManagerProfile> {
    return this.http
      .put<ApiResponse<ManagerProfile>>(`${API_BASE_URL}/hotels/${hotelId}/manager`, { userId })
      .pipe(map((res) => res.data));
  }

  unassignManager(hotelId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/hotels/${hotelId}/manager`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/users/${userId}`);
  }
}
