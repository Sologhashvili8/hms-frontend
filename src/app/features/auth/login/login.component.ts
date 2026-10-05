import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { HotelService } from '../../../core/services/hotel.service';
import { SocialLoginRowComponent } from '../../../shared/components/social-login-row/social-login-row.component';

const KAZBEGI_HOTEL_ID = 2002;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, SocialLoginRowComponent],
  templateUrl: './login.component.html',
  styleUrl: '../auth-form.scss'
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly hotelService = inject(HotelService);

  email = '';
  password = '';
  submitting = signal(false);
  error = signal<string | null>(null);
  heroPhoto = signal<string | null>(null);

  ngOnInit(): void {
    this.hotelService.getById(KAZBEGI_HOTEL_ID).subscribe((hotel) => {
      this.heroPhoto.set(hotel.imageUrl || null);
    });
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.submitting.set(false);
        if (err?.status === 403) {
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
          return;
        }
        this.error.set(err?.error?.message ?? 'Invalid email or password.');
      }
    });
  }
}
