import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  readonly destinations = [
    { label: 'Tbilisi', city: 'Tbilisi' },
    { label: 'Batumi', city: 'Batumi' },
    { label: 'Telavi (Kakheti)', city: 'Telavi' },
    { label: 'Kachreti (Kakheti)', city: 'Kachreti' },
    { label: 'Stepantsminda (Kazbegi)', city: 'Stepantsminda' }
  ];
}
