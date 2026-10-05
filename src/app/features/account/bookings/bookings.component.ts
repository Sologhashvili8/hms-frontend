import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MyReservation } from '../../../core/models/reservation.model';
import { GuestService } from '../../../core/services/guest.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {
  private readonly guestService = inject(GuestService);
  private readonly reservationService = inject(ReservationService);

  reservations = signal<MyReservation[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  cancelError = signal<string | null>(null);
  cancelingId = signal<number | null>(null);
  pendingCancel = signal<MyReservation | null>(null);

  ngOnInit(): void {
    this.load();
  }

  requestCancel(reservation: MyReservation): void {
    this.pendingCancel.set(reservation);
  }

  dismissCancel(): void {
    this.pendingCancel.set(null);
  }

  confirmCancel(): void {
    const reservation = this.pendingCancel();
    if (!reservation) return;

    this.pendingCancel.set(null);
    this.cancelingId.set(reservation.id);
    this.cancelError.set(null);

    this.reservationService.delete(reservation.hotelId, reservation.id).subscribe({
      next: () => {
        this.cancelingId.set(null);
        this.reservations.update((list) => list.filter((r) => r.id !== reservation.id));
      },
      error: (err) => {
        this.cancelingId.set(null);
        this.cancelError.set(err?.error?.message ?? 'Could not cancel this booking.');
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.guestService.getMyReservations().subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your bookings.');
        this.loading.set(false);
      }
    });
  }
}
