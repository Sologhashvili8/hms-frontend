import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './account-layout.component.html',
  styleUrl: './account-layout.component.scss'
})
export class AccountLayoutComponent implements OnInit {
  private readonly guestService = inject(GuestService);
  readonly auth = inject(AuthService);

  readonly firstName = signal<string | null>(null);

  ngOnInit(): void {
    this.guestService.getMe().subscribe((guest) => this.firstName.set(guest.firstName));
  }
}
