import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { CreateRoom, Room, RoomFilter, UpdateRoom } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);

  private roomsUrl(hotelId: number): string {
    return `${API_BASE_URL}/hotels/${hotelId}/rooms`;
  }

  getAll(hotelId: number, filter: RoomFilter = {}): Observable<Room[]> {
    let params = new HttpParams();
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice);
    if (filter.checkIn) params = params.set('checkIn', filter.checkIn);
    if (filter.checkOut) params = params.set('checkOut', filter.checkOut);

    return this.http
      .get<ApiResponse<Room[]>>(this.roomsUrl(hotelId), { params })
      .pipe(map((res) => res.data));
  }

  getById(hotelId: number, roomId: number): Observable<Room> {
    return this.http
      .get<ApiResponse<Room>>(`${this.roomsUrl(hotelId)}/${roomId}`)
      .pipe(map((res) => res.data));
  }

  create(hotelId: number, dto: CreateRoom): Observable<Room> {
    return this.http
      .post<ApiResponse<Room>>(this.roomsUrl(hotelId), dto)
      .pipe(map((res) => res.data));
  }

  update(hotelId: number, roomId: number, dto: UpdateRoom): Observable<Room> {
    return this.http
      .put<ApiResponse<Room>>(`${this.roomsUrl(hotelId)}/${roomId}`, dto)
      .pipe(map((res) => res.data));
  }

  delete(hotelId: number, roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.roomsUrl(hotelId)}/${roomId}`);
  }
}
