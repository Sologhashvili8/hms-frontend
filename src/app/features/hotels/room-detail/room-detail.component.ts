import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Hotel } from '../../../core/models/hotel.model';
import { Room } from '../../../core/models/room.model';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { RoomBookingFormComponent } from '../../../shared/components/room-booking-form/room-booking-form.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [RouterLink, RoomBookingFormComponent],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss'
})
export class RoomDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);

  readonly hotel = signal<Hotel | null>(null);
  readonly room = signal<Room | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const hotelId = Number(this.route.snapshot.paramMap.get('hotelId'));
    const roomId = Number(this.route.snapshot.paramMap.get('roomId'));

    forkJoin({
      hotel: this.hotelService.getById(hotelId),
      room: this.roomService.getById(hotelId, roomId)
    }).subscribe({
      next: ({ hotel, room }) => {
        this.hotel.set(hotel);
        this.room.set(room);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this room.');
        this.loading.set(false);
      }
    });
  }
}
