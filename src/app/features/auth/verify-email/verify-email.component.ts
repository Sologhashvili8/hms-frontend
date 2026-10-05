import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { HotelService } from '../../../core/services/hotel.service';
import { SocialLoginRowComponent } from '../../../shared/components/social-login-row/social-login-row.component';

const RADISSON_HOTEL_ID = 1005;

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink, SocialLoginRowComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: '../auth-form.scss'
})
export class VerifyEmailComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  code = '';
  submitting = signal(false);
  resending = signal(false);
  error = signal<string | null>(null);
  info = signal<string | null>(null);
  heroPhoto = signal<string | null>(null);

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    this.hotelService.getById(RADISSON_HOTEL_ID).subscribe((hotel) => {
      this.heroPhoto.set(hotel.imageUrl || null);
    });
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.info.set(null);

    this.auth.verifyEmail({ email: this.email, code: this.code }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Invalid or expired code.');
      }
    });
  }

  resend(): void {
    this.resending.set(true);
    this.error.set(null);
    this.info.set(null);

    this.auth.resendVerification(this.email).subscribe({
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
}
