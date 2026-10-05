import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { HotelService } from '../../../core/services/hotel.service';
import { SocialLoginRowComponent } from '../../../shared/components/social-login-row/social-login-row.component';

const VISUAL_HOTEL_ID = 1002; // Biltmore

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, SocialLoginRowComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../auth-form.scss'
})
export class ForgotPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);

  email = '';
  submitting = signal(false);
  error = signal<string | null>(null);
  heroPhoto = signal<string | null>(null);

  ngOnInit(): void {
    this.hotelService.getById(VISUAL_HOTEL_ID).subscribe((hotel) => {
      this.heroPhoto.set(hotel.imageUrl || null);
    });
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);

    this.auth.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Could not find an account with this email.');
      }
    });
  }
}
