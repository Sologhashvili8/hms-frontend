import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss'
})
export class HotelCardComponent {
  @Input({ required: true }) hotel!: Hotel;

  get stars(): number[] {
    return Array(Math.round(this.hotel.rating)).fill(0);
  }
}
