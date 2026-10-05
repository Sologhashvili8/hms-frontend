import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UpdateGuest } from '../../../core/models/guest.model';
import { AuthService } from '../../../core/services/auth.service';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: '../account-form.scss'
})
export class ProfileComponent implements OnInit {
  private readonly guestService = inject(GuestService);
  readonly auth = inject(AuthService);

  form: UpdateGuest = { firstName: '', lastName: '', phoneNumber: '' };
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit(): void {
    this.guestService.getMe().subscribe({
      next: (guest) => {
        this.form = { firstName: guest.firstName, lastName: guest.lastName, phoneNumber: guest.phoneNumber };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your profile.');
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    this.guestService.updateMe(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Could not save your profile.');
      }
    });
  }
}
