import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { BluetoothService } from '../../services/bluetooth.service';

/*
This component is the header of the application.
It displays the current date and time and provides a connection status to the Bluetooth device.
It also includes some hard coded data about a theoretical patient and their nurse.
The header is displayed on all pages of the application.
*/


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
