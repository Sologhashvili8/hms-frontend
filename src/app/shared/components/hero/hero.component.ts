import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface HeroSearch {
  city: string;
  minRating: number | null;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Output() search = new EventEmitter<HeroSearch>();

  city = '';
  minRating: number | null = null;

  emitSearch(): void {
    this.search.emit({ city: this.city.trim(), minRating: this.minRating });
  }
}
