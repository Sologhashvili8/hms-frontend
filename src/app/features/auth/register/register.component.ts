import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { HotelService } from '../../../core/services/hotel.service';
import { SocialLoginRowComponent } from '../../../shared/components/social-login-row/social-login-row.component';

const RADISSON_HOTEL_ID = 1005;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, SocialLoginRowComponent],
  templateUrl: './register.component.html',
  styleUrl: '../auth-form.scss'
})
export class RegisterComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly hotelService = inject(HotelService);

  form: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    personalNumber: '',
    phoneNumber: ''
  };

  submitting = signal(false);
  error = signal<string | null>(null);
  heroPhoto = signal<string | null>(null);

  ngOnInit(): void {
    this.hotelService.getById(RADISSON_HOTEL_ID).subscribe((hotel) => {
      this.heroPhoto.set(hotel.imageUrl || null);
    });
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);

    this.auth.register(this.form).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/verify-email'], { queryParams: { email: this.form.email } });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Could not create your account.');
      }
    });
  }
}
