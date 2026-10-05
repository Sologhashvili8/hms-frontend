import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Hotel } from '../../core/models/hotel.model';
import { HotelService } from '../../core/services/hotel.service';
import { HeroComponent, HeroSearch } from '../../shared/components/hero/hero.component';
import { HotelCardComponent } from '../../shared/components/hotel-card/hotel-card.component';

interface DestinationSummary {
  city: string;
  country: string;
  hotelCount: number;
  imageUrl: string | null;
}

const DESTINATION_IMAGES: Record<string, string> = {
  Kachreti: 'https://res.cloudinary.com/nxfn3tll/image/upload/f_auto,q_auto/hms/cities/kachreti',
  Tbilisi: 'https://res.cloudinary.com/nxfn3tll/image/upload/f_auto,q_auto/hms/cities/tbilisi',
  Batumi:
    'https://res.cloudinary.com/nxfn3tll/image/upload/f_auto,q_auto/hms/cities/batumi',
  Stepantsminda: 'https://res.cloudinary.com/nxfn3tll/image/upload/f_auto,q_auto/hms/cities/stepantsminda',
  Telavi: 'https://res.cloudinary.com/nxfn3tll/image/upload/f_auto,q_auto/hms/cities/telavi'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, HotelCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);

  readonly hotels = signal<Hotel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly destinations = computed<DestinationSummary[]>(() => {
    const map = new Map<string, DestinationSummary>();
    for (const hotel of this.hotels()) {
      const existing = map.get(hotel.city);
      if (existing) existing.hotelCount++;
      else
        map.set(hotel.city, {
          city: hotel.city,
          country: hotel.country,
          hotelCount: 1,
          imageUrl: DESTINATION_IMAGES[hotel.city] ?? null
        });
    }
    return [...map.values()].sort((a, b) => b.hotelCount - a.hotelCount);
  });

  readonly recommendedHotels = computed<Hotel[]>(() =>
    [...this.hotels()].sort((a, b) => b.rating - a.rating).slice(0, 4)
  );

  ngOnInit(): void {
    this.hotelService.getAll().subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load hotels. Is the API running?');
        this.loading.set(false);
      }
    });
  }

  onSearch(search: HeroSearch): void {
    const queryParams: Record<string, string | number> = {};
    if (search.city) queryParams['city'] = search.city;
    if (search.minRating) queryParams['rating'] = search.minRating;
    this.router.navigate(['/rooms'], { queryParams });
  }
}
