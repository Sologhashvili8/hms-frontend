import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';

type BookingStep = 'closed' | 'dates' | 'payment';

@Component({
  selector: 'app-room-booking-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-booking-form.component.html',
  styleUrl: './room-booking-form.component.scss'
})
export class RoomBookingFormComponent {
  @Input({ required: true }) hotelId!: number;
  @Input({ required: true }) roomId!: number;
  @Output() booked = new EventEmitter<void>();

  private readonly auth = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly router = inject(Router);

  readonly step = signal<BookingStep>('closed');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  checkInDate = '';
  checkOutDate = '';
  cardNumber = '';
  phoneNumber = '';
  personalNumber = '';

  get minCheckIn(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get minCheckOut(): string {
    return this.checkInDate || this.minCheckIn;
  }

  openBooking(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isGuest()) {
      this.error.set('Only guest accounts can book rooms.');
      return;
    }

    this.error.set(null);
    this.success.set(false);
    this.step.set('dates');
  }

  cancelBooking(): void {
    this.step.set('closed');
    this.error.set(null);
  }

  proceedToPayment(): void {
    if (!this.checkInDate || !this.checkOutDate) {
      this.error.set('Please choose both check-in and check-out dates.');
      return;
    }
    if (this.checkOutDate <= this.checkInDate) {
      this.error.set('Check-out date must be after check-in date.');
      return;
    }

    this.error.set(null);
    this.step.set('payment');
  }

  backToDates(): void {
    this.step.set('dates');
    this.error.set(null);
  }

  confirmBooking(): void {
    if (!/^\d{16}$/.test(this.cardNumber)) {
      this.error.set('Card number must be exactly 16 digits.');
      return;
    }
    if (!/^5\d{8}$/.test(this.phoneNumber)) {
      this.error.set('Phone number must start with 5 and be 9 digits long.');
      return;
    }
    if (!/^\d{11}$/.test(this.personalNumber)) {
      this.error.set('Personal number must be exactly 11 digits.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.reservationService
      .create(this.hotelId, {
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
        roomIds: [this.roomId],
        payment: {
          cardNumber: this.cardNumber,
          phoneNumber: this.phoneNumber,
          personalNumber: this.personalNumber
        }
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          this.step.set('closed');
          this.resetForm();
          this.booked.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not book this room for the selected dates.');
        }
      });
  }

  private resetForm(): void {
    this.checkInDate = '';
    this.checkOutDate = '';
    this.cardNumber = '';
    this.phoneNumber = '';
    this.personalNumber = '';
  }
}
