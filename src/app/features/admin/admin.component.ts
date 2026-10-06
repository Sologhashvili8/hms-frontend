import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminHotel, AdminUser } from '../../core/models/admin.model';
import { CreateHotel } from '../../core/models/hotel.model';
import { AdminService } from '../../core/services/admin.service';
import { HotelService } from '../../core/services/hotel.service';
import { UploadService } from '../../core/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface PendingAction {
  title: string;
  message: string;
  confirmLabel: string;
  run: () => void;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './admin.component.html',
  styleUrl: '../staff.scss'
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly hotelService = inject(HotelService);
  private readonly uploadService = inject(UploadService);

  readonly tab = signal<'hotels' | 'users'>('hotels');
  readonly hotels = signal<AdminHotel[]>([]);
  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly pending = signal<PendingAction | null>(null);

  readonly showHotelForm = signal(false);
  readonly savingHotel = signal(false);
  readonly uploading = signal(false);
  newHotel: CreateHotel = this.emptyHotel();

  assignUser: Record<number, string> = {};
  assignHotel: Record<string, number> = {};

  readonly freeHotels = computed(() => this.hotels().filter((h) => !h.managerId));
  readonly assignableUsers = computed(() =>
    this.users().filter((u) => !u.roles.includes('Admin') && u.managedHotelId === null)
  );

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getHotels().subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.adminService.getUsers().subscribe({
          next: (users) => {
            this.users.set(users);
            this.loading.set(false);
          },
          error: (err) => this.fail(err, 'Could not load users.')
        });
      },
      error: (err) => this.fail(err, 'Could not load hotels.')
    });
  }

  setTab(tab: 'hotels' | 'users'): void {
    this.tab.set(tab);
    this.notice.set(null);
    this.error.set(null);
  }

  assignToHotel(hotel: AdminHotel): void {
    const userId = this.assignUser[hotel.id];
    if (!userId) return;
    this.runAssign(hotel.id, userId);
  }

  assignFromUser(user: AdminUser): void {
    const hotelId = this.assignHotel[user.id];
    if (!hotelId) return;
    this.runAssign(hotelId, user.id);
  }

  askUnassign(hotelId: number, hotelName: string, managerName: string | null): void {
    this.pending.set({
      title: 'Remove manager?',
      message: `${managerName ?? 'The manager'} will no longer manage ${hotelName}.`,
      confirmLabel: 'Remove',
      run: () => {
        this.adminService.unassignManager(hotelId).subscribe({
          next: () => this.done('Manager removed.'),
          error: (err) => this.fail(err, 'Could not remove the manager.')
        });
      }
    });
  }

  askDeleteHotel(hotel: AdminHotel): void {
    this.pending.set({
      title: 'Delete hotel?',
      message: `${hotel.name} and all its rooms will be deleted permanently. Hotels whose rooms have reservations cannot be deleted.`,
      confirmLabel: 'Delete',
      run: () => {
        this.hotelService.delete(hotel.id).subscribe({
          next: () => this.done('Hotel deleted.'),
          error: (err) => this.fail(err, 'Could not delete the hotel.')
        });
      }
    });
  }

  askDeleteUser(user: AdminUser): void {
    this.pending.set({
      title: 'Delete user?',
      message: `${user.email} will be deleted permanently together with their reservations, and this email will no longer be able to log in.`,
      confirmLabel: 'Delete',
      run: () => {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => this.done('User deleted.'),
          error: (err) => this.fail(err, 'Could not delete the user.')
        });
      }
    });
  }

  confirmPending(): void {
    const action = this.pending();
    this.pending.set(null);
    action?.run();
  }

  openHotelForm(): void {
    this.newHotel = this.emptyHotel();
    this.showHotelForm.set(true);
  }

  uploadHotelImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadService.uploadImage(file).subscribe({
      next: (url) => {
        this.newHotel.imageUrl = url;
        this.uploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set(err?.error?.message ?? 'Could not upload the image.');
      }
    });
  }

  saveHotel(): void {
    this.savingHotel.set(true);
    this.error.set(null);

    this.hotelService.create(this.newHotel).subscribe({
      next: () => {
        this.savingHotel.set(false);
        this.showHotelForm.set(false);
        this.done('Hotel created.');
      },
      error: (err) => {
        this.savingHotel.set(false);
        this.error.set(err?.error?.message ?? 'Could not create the hotel.');
      }
    });
  }

  hasRole(user: AdminUser, role: string): boolean {
    return user.roles.includes(role);
  }

  private runAssign(hotelId: number, userId: string): void {
    this.error.set(null);
    this.adminService.assignManager(hotelId, userId).subscribe({
      next: (manager) => {
        this.assignUser = {};
        this.assignHotel = {};
        this.done(`${manager.firstName} ${manager.lastName} is now the manager of ${manager.hotelName}. They need to log in again to see the manager panel.`);
      },
      error: (err) => this.fail(err, 'Could not assign the manager.')
    });
  }

  private done(message: string): void {
    this.notice.set(message);
    this.reload();
  }

  private fail(err: { error?: { message?: string } }, fallback: string): void {
    this.loading.set(false);
    this.error.set(err?.error?.message ?? fallback);
  }

  private emptyHotel(): CreateHotel {
    return { name: '', rating: 5, country: 'Georgia', city: '', address: '', imageUrl: '' };
  }
}
