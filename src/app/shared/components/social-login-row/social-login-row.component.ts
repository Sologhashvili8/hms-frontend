import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-social-login-row',
  standalone: true,
  templateUrl: './social-login-row.component.html',
  styleUrl: './social-login-row.component.scss'
})
export class SocialLoginRowComponent {
  @Input() label = 'Log in with';
}
