import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RoomListItem } from '../../../core/models/room.model';

@Component({
  selector: 'app-room-browse-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './room-browse-card.component.html',
  styleUrl: './room-browse-card.component.scss'
})
export class RoomBrowseCardComponent {
  @Input({ required: true }) room!: RoomListItem;

  get stars(): number[] {
    return Array(Math.round(this.room.hotelRating)).fill(0);
  }
}
