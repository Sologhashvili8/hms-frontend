import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: '../account-form.scss'
})
export class SettingsComponent {
  private readonly auth = inject(AuthService);

  currentPassword = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  saving = signal(false);
  sending = signal(false);
  info = signal<string | null>(null);
  error = signal<string | null>(null);
  success = signal(false);

  sendCode(): void {
    this.sending.set(true);
    this.error.set(null);
    this.info.set(null);

    this.auth.sendChangePasswordCode().subscribe({
      next: () => {
        this.sending.set(false);
        this.info.set(`A 6-digit code was sent to ${this.auth.email()}.`);
      },
      error: (err) => {
        this.sending.set(false);
        this.error.set(err?.error?.message ?? 'Could not send the code.');
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);
    this.info.set(null);

    this.auth
      .changePassword({
        currentPassword: this.currentPassword,
        code: this.code,
        newPassword: this.newPassword
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set(true);
          this.currentPassword = '';
          this.code = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? 'Could not change your password.');
        }
      });
  }
}
