import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  private readonly guestService = inject(GuestService);
  private readonly router = inject(Router);

  readonly firstName = signal<string | null>(null);
  menuOpen = false;

  constructor() {
    effect(() => {
      if (this.auth.isGuest()) {
        this.guestService.getMe().subscribe((guest) => this.firstName.set(guest.firstName));
      } else {
        this.firstName.set(null);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigateByUrl('/');
  }
}
