import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { BluetoothService } from '../../services/bluetooth.service';

@Component({
  selector: 'app-header',
  imports: [DatePipe, MatIcon, MatCardModule, RouterOutlet, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected bluetoothService = inject(BluetoothService);

  date = new Date();
  constructor() {
    setInterval(() => {
      this.date = new Date();
    }, 1000);
  }
}
