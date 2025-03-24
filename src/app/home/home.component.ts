import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BluetoothService } from '../../services/bluetooth.service';
import { pipe, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, AsyncPipe],
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
    { id: '1', name: 'Details', status: 'Connected' },
  ];

  async connect() {
    await this.bluetoothService.tryConnect();
    this.updateConnectionMessage();
  }

  connectionMessage = '';

  private updateConnectionMessage(): void {
    if (this.bluetoothService.connectionStatus$.getValue()) {
      this.connectionMessage = 'Bluetooth device connected successfully';
    } else {
      this.connectionMessage = 'No Bluetooth device connected';
    }
  }
}
