import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BluetoothService } from '../../services/bluetooth';
import { pipe } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected router = inject(Router);
  protected bluetoothService = inject(BluetoothService);

  navigateToDetails(id: string) {
    this.router.navigate(['/details', id]);
  }

  arduinos = [
    { id: '1', name: 'Arduino 1', status: 'Connected' },
    { id: '2', name: 'Arduino 2', status: 'Connected' },
    { id: '3', name: 'Arduino 3', status: 'Disconnected' },
  ];

  isConnected = false;
  connectionMessage = '';

  ngOnInit() {
    this.bluetoothService.connectionStatus$.pipe().subscribe((isConnected) => {
      this.isConnected = isConnected;
      this.updateConnectionMessage();
    });

    // Check initial connection status
    this.updateConnectionMessage();
  }

  private updateConnectionMessage(): void {
    if (this.isConnected) {
      this.connectionMessage = 'Bluetooth device connected successfully';
    } else {
      this.connectionMessage = 'No Bluetooth device connected';
    }
  }
}
