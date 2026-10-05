import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { HotelService } from '../../../core/services/hotel.service';
import { SocialLoginRowComponent } from '../../../shared/components/social-login-row/social-login-row.component';

const VISUAL_HOTEL_ID = 1002; // Biltmore

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, SocialLoginRowComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: '../auth-form.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  submitting = signal(false);
  resending = signal(false);
  info = signal<string | null>(null);
  error = signal<string | null>(null);
  heroPhoto = signal<string | null>(null);

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    this.hotelService.getById(VISUAL_HOTEL_ID).subscribe((hotel) => {
      this.heroPhoto.set(hotel.imageUrl || null);
    });
  }

  resend(): void {
    this.resending.set(true);
    this.error.set(null);
    this.info.set(null);

    this.auth.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.resending.set(false);
        this.info.set('A new code was sent to your email.');
      },
      error: (err) => {
        this.resending.set(false);
        this.error.set(err?.error?.message ?? 'Could not send the code.');
      }
    });
  }

  submit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.auth
      .resetPassword({ email: this.email, code: this.code, newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not reset your password.');
        }
      });
  }
}
