import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Hotel } from '../../../core/models/hotel.model';
import { Room } from '../../../core/models/room.model';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { RoomCardComponent } from '../../../shared/components/room-card/room-card.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [RouterLink, RoomCardComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.scss'
})
export class HotelDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);

  readonly hotel = signal<Hotel | null>(null);
  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  get stars(): number[] {
    return Array.from({ length: this.hotel()?.rating ?? 0 });
  }

  ngOnInit(): void {
    const hotelId = Number(this.route.snapshot.paramMap.get('hotelId'));

    forkJoin({
      hotel: this.hotelService.getById(hotelId),
      rooms: this.roomService.getAll(hotelId)
    }).subscribe({
      next: ({ hotel, rooms }) => {
        this.hotel.set(hotel);
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this hotel.');
        this.loading.set(false);
      }
    });
  }
}
