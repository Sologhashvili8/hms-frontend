import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Room } from '../../../core/models/room.model';
import { RoomBookingFormComponent } from '../room-booking-form/room-booking-form.component';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [RouterLink, RoomBookingFormComponent],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.scss'
})
export class RoomCardComponent {
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) hotelId!: number;
}
