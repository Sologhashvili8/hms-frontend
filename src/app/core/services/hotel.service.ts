import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { CreateHotel, Hotel, HotelFilter, UpdateHotel } from '../models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/hotels`;

  getAll(filter: HotelFilter = {}): Observable<Hotel[]> {
    let params = new HttpParams();
    if (filter.country) params = params.set('country', filter.country);
    if (filter.city) params = params.set('city', filter.city);
    if (filter.rating) params = params.set('rating', filter.rating);

    return this.http
      .get<ApiResponse<Hotel[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getById(hotelId: number): Observable<Hotel> {
    return this.http
      .get<ApiResponse<Hotel>>(`${this.baseUrl}/${hotelId}`)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateHotel): Observable<Hotel> {
    return this.http.post<ApiResponse<Hotel>>(this.baseUrl, dto).pipe(map((res) => res.data));
  }

  update(hotelId: number, dto: UpdateHotel): Observable<Hotel> {
    return this.http
      .put<ApiResponse<Hotel>>(`${this.baseUrl}/${hotelId}`, dto)
      .pipe(map((res) => res.data));
  }

  delete(hotelId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${hotelId}`);
  }
}
