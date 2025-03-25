import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-header',
  imports: [DatePipe, MatIcon, MatCardModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  date = new Date();
  constructor() {
    setInterval(() => {
      this.date = new Date();
    }, 1000);
  }
}
