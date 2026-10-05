import type { Routes } from '@angular/router';

import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./features/rooms/room-list/room-list.component').then((m) => m.RoomListComponent)
  },
  {
    path: 'hotels/:hotelId',
    loadComponent: () =>
      import('./features/hotels/hotel-detail/hotel-detail.component').then((m) => m.HotelDetailComponent)
  },
  {
    path: 'hotels/:hotelId/rooms/:roomId',
    loadComponent: () =>
      import('./features/hotels/room-detail/room-detail.component').then((m) => m.RoomDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      )
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      )
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      )
  },
  {
    path: 'account',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/account/account-layout/account-layout.component').then(
        (m) => m.AccountLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/account/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/account/bookings/bookings.component').then((m) => m.BookingsComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/account/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
