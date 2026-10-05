import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { HotelFilter } from '../../../core/models/hotel.model';
import { RoomListItem } from '../../../core/models/room.model';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { RoomBrowseCardComponent } from '../../../shared/components/room-browse-card/room-browse-card.component';

export type RoomSort = 'rating-desc' | 'price-asc' | 'city-asc';

interface StarOption {
  stars: number;
  count: number;
  filled: number[];
}

interface HotelOption {
  hotelId: number;
  hotelName: string;
  count: number;
}

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [RoomBrowseCardComponent],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly route = inject(ActivatedRoute);

  readonly rooms = signal<RoomListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly sort = signal<RoomSort>('rating-desc');
  readonly starFilters = signal<Set<number>>(new Set());
  readonly amenityFilters = signal<Set<string>>(new Set());
  readonly hotelFilters = signal<Set<number>>(new Set());
  readonly budgetMin = signal(0);
  readonly budgetMax = signal(0);

  private draggingThumb: 'min' | 'max' | null = null;
  private sliderEl: HTMLElement | null = null;

  readonly priceBounds = computed<{ min: number; max: number }>(() => {
    const rooms = this.rooms();
    if (rooms.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...rooms.map((r) => r.price)),
      max: Math.max(...rooms.map((r) => r.price))
    };
  });

  readonly minHandlePercent = computed(() => this.percentFor(this.budgetMin()));
  readonly maxHandlePercent = computed(() => this.percentFor(this.budgetMax()));

  readonly availableAmenities = computed<string[]>(() => {
    const set = new Set<string>();
    this.rooms().forEach((room) => room.amenities.forEach((a) => set.add(a)));
    return [...set].sort();
  });

  readonly starOptions = computed<StarOption[]>(() => {
    const counts = new Map<number, number>();
    for (const room of this.rooms()) {
      const stars = Math.floor(room.hotelRating);
      counts.set(stars, (counts.get(stars) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([stars, count]) => ({ stars, count, filled: Array(stars).fill(0) }));
  });

  readonly hotelOptions = computed<HotelOption[]>(() => {
    const counts = new Map<number, HotelOption>();
    for (const room of this.rooms()) {
      const existing = counts.get(room.hotelId);
      if (existing) existing.count++;
      else counts.set(room.hotelId, { hotelId: room.hotelId, hotelName: room.hotelName, count: 1 });
    }
    return [...counts.values()].sort((a, b) => a.hotelName.localeCompare(b.hotelName));
  });

  readonly filteredRooms = computed<RoomListItem[]>(() => {
    const stars = this.starFilters();
    const amenities = this.amenityFilters();
    const hotels = this.hotelFilters();
    const min = this.budgetMin();
    const max = this.budgetMax();

    let list = this.rooms().filter((room) => {
      if (stars.size > 0 && !stars.has(Math.floor(room.hotelRating))) return false;

      if (hotels.size > 0 && !hotels.has(room.hotelId)) return false;

      if (amenities.size > 0) {
        for (const a of amenities) {
          if (!room.amenities.includes(a)) return false;
        }
      }

      if (max > 0 && (room.price > max || room.price < min)) return false;

      return true;
    });

    switch (this.sort()) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'city-asc':
        list = [...list].sort((a, b) => a.hotelCity.localeCompare(b.hotelCity));
        break;
      case 'rating-desc':
      default:
        list = [...list].sort((a, b) => b.hotelRating - a.hotelRating);
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const city = params.get('city');
      const rating = Number(params.get('rating')) || null;
      const filter: HotelFilter = {};
      if (city) filter.city = city;
      if (rating) filter.rating = rating;
      this.loadRooms(filter);
    });
  }

  setSort(value: RoomSort): void {
    this.sort.set(value);
  }

  toggleStar(stars: number): void {
    const next = new Set(this.starFilters());
    if (next.has(stars)) next.delete(stars);
    else next.add(stars);
    this.starFilters.set(next);
  }

  toggleAmenity(name: string): void {
    const next = new Set(this.amenityFilters());
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this.amenityFilters.set(next);
  }

  toggleHotel(hotelId: number): void {
    const next = new Set(this.hotelFilters());
    if (next.has(hotelId)) next.delete(hotelId);
    else next.add(hotelId);
    this.hotelFilters.set(next);
  }

  clearFilters(): void {
    this.starFilters.set(new Set());
    this.amenityFilters.set(new Set());
    this.hotelFilters.set(new Set());
    const bounds = this.priceBounds();
    this.budgetMin.set(bounds.min);
    this.budgetMax.set(bounds.max);
  }

  onHandlePointerDown(thumb: 'min' | 'max', event: PointerEvent, slider: HTMLElement): void {
    event.preventDefault();
    this.draggingThumb = thumb;
    this.sliderEl = slider;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onHandlePointerMove(event: PointerEvent): void {
    if (!this.draggingThumb || !this.sliderEl) return;

    const rect = this.sliderEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const { min, max } = this.priceBounds();
    const value = Math.round(min + ratio * (max - min));

    if (this.draggingThumb === 'min') {
      this.budgetMin.set(Math.min(value, this.budgetMax()));
    } else {
      this.budgetMax.set(Math.max(value, this.budgetMin()));
    }
  }

  onHandlePointerUp(): void {
    this.draggingThumb = null;
    this.sliderEl = null;
  }

  onHandleKeydown(thumb: 'min' | 'max', event: KeyboardEvent): void {
    const step = 10;
    let delta = 0;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step;
    else return;

    event.preventDefault();
    const { min, max } = this.priceBounds();

    if (thumb === 'min') {
      this.budgetMin.set(Math.min(Math.max(this.budgetMin() + delta, min), this.budgetMax()));
    } else {
      this.budgetMax.set(Math.max(Math.min(this.budgetMax() + delta, max), this.budgetMin()));
    }
  }

  private percentFor(value: number): number {
    const { min, max } = this.priceBounds();
    if (max <= min) return 0;
    return ((value - min) / (max - min)) * 100;
  }

  private loadRooms(filter: HotelFilter = {}): void {
    this.loading.set(true);
    this.error.set(null);
    this.starFilters.set(new Set());
    this.amenityFilters.set(new Set());
    this.hotelFilters.set(new Set());

    this.hotelService.getAll(filter).subscribe({
      next: (hotels) => {
        if (hotels.length === 0) {
          this.rooms.set([]);
          this.loading.set(false);
          this.budgetMin.set(0);
          this.budgetMax.set(0);
          return;
        }

        forkJoin(hotels.map((hotel) => this.roomService.getAll(hotel.id))).subscribe({
          next: (roomLists) => {
            const items: RoomListItem[] = [];
            hotels.forEach((hotel, i) => {
              roomLists[i].forEach((room) => {
                items.push({
                  ...room,
                  hotelName: hotel.name,
                  hotelCity: hotel.city,
                  hotelCountry: hotel.country,
                  hotelRating: hotel.rating
                });
              });
            });

            this.rooms.set(items);
            this.loading.set(false);

            const bounds = this.priceBounds();
            this.budgetMin.set(bounds.min);
            this.budgetMax.set(bounds.max);
          },
          error: () => {
            this.error.set('Could not load rooms. Is the API running?');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Could not load hotels. Is the API running?');
        this.loading.set(false);
      }
    });
  }
}
