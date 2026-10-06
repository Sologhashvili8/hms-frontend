import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ManagerProfile } from '../../core/models/admin.model';
import { Amenity } from '../../core/models/amenity.model';
import { CreateStaffReservation, StaffReservation } from '../../core/models/reservation.model';
import { Room } from '../../core/models/room.model';
import { AmenityService } from '../../core/services/amenity.service';
import { ManagerService } from '../../core/services/manager.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RoomService } from '../../core/services/room.service';
import { UploadService } from '../../core/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface PendingAction {
  title: string;
  message: string;
  confirmLabel: string;
  run: () => void;
}

interface RoomForm {
  id: number | null;
  name: string;
  price: number;
  capacity: number;
  amenityIds: number[];
  photoUrls: string[];
}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './manager.component.html',
  styleUrl: '../staff.scss'
})
export class ManagerComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly roomService = inject(RoomService);
  private readonly amenityService = inject(AmenityService);
  private readonly reservationService = inject(ReservationService);
  private readonly uploadService = inject(UploadService);

  readonly profile = signal<ManagerProfile | null>(null);
  readonly tab = signal<'rooms' | 'reservations'>('rooms');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly pending = signal<PendingAction | null>(null);

  readonly rooms = signal<Room[]>([]);
  readonly amenities = signal<Amenity[]>([]);
  readonly reservations = signal<StaffReservation[]>([]);

  readonly roomForm = signal<RoomForm | null>(null);
  readonly savingRoom = signal(false);
  readonly uploading = signal(false);
  priceDrafts: Record<number, number> = {};

  readonly showBookingForm = signal(false);
  readonly savingBooking = signal(false);
  readonly availableRooms = signal<Room[]>([]);
  booking: CreateStaffReservation = this.emptyBooking();

  readonly bookingTotal = computed(() => {
    const nights = this.nightsOf(this.booking.checkInDate, this.booking.checkOutDate);
    const selected = this.availableRooms().filter((r) => this.booking.roomIds.includes(r.id));
    return selected.reduce((sum, r) => sum + r.price, 0) * nights;
  });

  readonly minPhotos = 4;
  readonly today = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.managerService.getMe().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.amenityService.getAll().subscribe((amenities) => this.amenities.set(amenities));
        this.loadAll();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'You are not assigned to a hotel yet.');
      }
    });
  }

  setTab(tab: 'rooms' | 'reservations'): void {
    this.tab.set(tab);
    this.notice.set(null);
    this.error.set(null);
  }

  loadAll(): void {
    const hotelId = this.profile()?.hotelId;
    if (hotelId === undefined) return;

    this.loading.set(true);
    this.roomService.getAll(hotelId).subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.priceDrafts = {};
        rooms.forEach((r) => (this.priceDrafts[r.id] = r.price));
        this.reservationService.getStaffReservations(hotelId).subscribe({
          next: (reservations) => {
            this.reservations.set(reservations);
            this.loading.set(false);
          },
          error: (err) => this.fail(err, 'Could not load reservations.')
        });
      },
      error: (err) => this.fail(err, 'Could not load rooms.')
    });
  }

  savePrice(room: Room): void {
    const hotelId = this.profile()?.hotelId;
    const price = Number(this.priceDrafts[room.id]);
    if (hotelId === undefined || !(price > 0)) {
      this.error.set('Price must be greater than 0.');
      return;
    }

    this.error.set(null);
    this.roomService
      .update(hotelId, room.id, {
        name: room.name,
        price,
        capacity: room.capacity,
        amenityIds: this.amenityIdsOf(room),
        photoUrls: room.photoUrls
      })
      .subscribe({
        next: () => this.done(`Price of ${room.name} updated.`),
        error: (err) => this.fail(err, 'Could not update the price.')
      });
  }

  priceChanged(room: Room): boolean {
    return Number(this.priceDrafts[room.id]) !== room.price;
  }

  openNewRoom(): void {
    this.roomForm.set({ id: null, name: '', price: 100, capacity: 2, amenityIds: [], photoUrls: [] });
    this.notice.set(null);
  }

  openEditRoom(room: Room): void {
    this.roomForm.set({
      id: room.id,
      name: room.name,
      price: room.price,
      capacity: room.capacity,
      amenityIds: this.amenityIdsOf(room),
      photoUrls: [...room.photoUrls]
    });
    this.notice.set(null);
  }

  closeRoomForm(): void {
    this.roomForm.set(null);
  }

  toggleAmenity(id: number): void {
    const form = this.roomForm();
    if (!form) return;

    form.amenityIds = form.amenityIds.includes(id)
      ? form.amenityIds.filter((a) => a !== id)
      : [...form.amenityIds, id];
  }

  uploadPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const form = this.roomForm();
    if (!form || files.length === 0) return;

    this.uploading.set(true);
    this.error.set(null);
    this.uploadSequentially(files, form, () => {
      this.uploading.set(false);
      input.value = '';
    });
  }

  removePhoto(index: number): void {
    const form = this.roomForm();
    if (!form) return;
    form.photoUrls = form.photoUrls.filter((_, i) => i !== index);
  }

  saveRoom(): void {
    const hotelId = this.profile()?.hotelId;
    const form = this.roomForm();
    if (hotelId === undefined || !form) return;

    if (form.photoUrls.length < this.minPhotos) {
      this.error.set(`Add at least ${this.minPhotos} photos.`);
      return;
    }

    const dto = {
      name: form.name,
      price: Number(form.price),
      capacity: Number(form.capacity),
      amenityIds: form.amenityIds,
      photoUrls: form.photoUrls
    };

    this.savingRoom.set(true);
    this.error.set(null);

    const request =
      form.id === null
        ? this.roomService.create(hotelId, dto)
        : this.roomService.update(hotelId, form.id, dto);

    request.subscribe({
      next: () => {
        this.savingRoom.set(false);
        this.roomForm.set(null);
        this.done(form.id === null ? 'Room added.' : 'Room updated.');
      },
      error: (err) => {
        this.savingRoom.set(false);
        this.error.set(err?.error?.message ?? 'Could not save the room.');
      }
    });
  }

  askDeleteRoom(room: Room): void {
    const hotelId = this.profile()?.hotelId;
    if (hotelId === undefined) return;

    this.pending.set({
      title: 'Delete room?',
      message: `${room.name} will be deleted. Rooms with active or upcoming reservations cannot be deleted.`,
      confirmLabel: 'Delete',
      run: () => {
        this.roomService.delete(hotelId, room.id).subscribe({
          next: () => this.done('Room deleted.'),
          error: (err) => this.fail(err, 'Could not delete the room.')
        });
      }
    });
  }

  askCancelReservation(reservation: StaffReservation): void {
    const hotelId = this.profile()?.hotelId;
    if (hotelId === undefined) return;

    this.pending.set({
      title: 'Cancel reservation?',
      message: `Reservation #${reservation.id} for ${reservation.guestName} will be cancelled.`,
      confirmLabel: 'Cancel reservation',
      run: () => {
        this.reservationService.delete(hotelId, reservation.id).subscribe({
          next: () => this.done('Reservation cancelled.'),
          error: (err) => this.fail(err, 'Could not cancel the reservation.')
        });
      }
    });
  }

  confirmPending(): void {
    const action = this.pending();
    this.pending.set(null);
    action?.run();
  }

  openBookingForm(): void {
    this.booking = this.emptyBooking();
    this.availableRooms.set([]);
    this.showBookingForm.set(true);
    this.notice.set(null);
  }

  datesChanged(): void {
    const hotelId = this.profile()?.hotelId;
    const { checkInDate, checkOutDate } = this.booking;
    this.booking.roomIds = [];
    this.availableRooms.set([]);

    if (hotelId === undefined || !checkInDate || !checkOutDate || checkOutDate <= checkInDate) return;

    this.roomService.getAll(hotelId, { checkIn: checkInDate, checkOut: checkOutDate }).subscribe({
      next: (rooms) => this.availableRooms.set(rooms),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not load available rooms.')
    });
  }

  toggleBookingRoom(id: number): void {
    this.booking.roomIds = this.booking.roomIds.includes(id)
      ? this.booking.roomIds.filter((r) => r !== id)
      : [...this.booking.roomIds, id];
  }

  saveBooking(): void {
    const hotelId = this.profile()?.hotelId;
    if (hotelId === undefined) return;

    if (this.booking.roomIds.length === 0) {
      this.error.set('Select at least one room.');
      return;
    }

    this.savingBooking.set(true);
    this.error.set(null);

    this.reservationService.createForGuest(hotelId, this.booking).subscribe({
      next: () => {
        this.savingBooking.set(false);
        this.showBookingForm.set(false);
        this.done('Reservation created.');
      },
      error: (err) => {
        this.savingBooking.set(false);
        this.error.set(err?.error?.message ?? 'Could not create the reservation.');
      }
    });
  }

  private uploadSequentially(files: File[], form: RoomForm, finish: () => void): void {
    const [file, ...rest] = files;
    if (!file) {
      finish();
      return;
    }

    this.uploadService.uploadImage(file).subscribe({
      next: (url) => {
        form.photoUrls = [...form.photoUrls, url];
        this.uploadSequentially(rest, form, finish);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not upload the image.');
        finish();
      }
    });
  }

  private amenityIdsOf(room: Room): number[] {
    return this.amenities()
      .filter((a) => room.amenities.includes(a.name))
      .map((a) => a.id);
  }

  private nightsOf(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return diff > 0 ? Math.round(diff) : 0;
  }

  private done(message: string): void {
    this.notice.set(message);
    this.loadAll();
  }

  private fail(err: { error?: { message?: string } }, fallback: string): void {
    this.loading.set(false);
    this.error.set(err?.error?.message ?? fallback);
  }

  private emptyBooking(): CreateStaffReservation {
    return {
      firstName: '',
      lastName: '',
      personalNumber: '',
      phoneNumber: '',
      checkInDate: '',
      checkOutDate: '',
      roomIds: []
    };
  }
}
