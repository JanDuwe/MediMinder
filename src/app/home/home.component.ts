import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected router = inject(Router);

  navigateToDetails(id: string) {
    console.log(id);
    this.router.navigate(['/details', id]);
  }

  arduinos = [
    { id: '1', name: 'Arduino 1', status: 'Connected' },
    { id: '2', name: 'Arduino 2', status: 'Connected' },
    { id: '3', name: 'Arduino 3', status: 'Disconnected' },
  ];
}
