import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BluetoothService } from '../../services/bluetooth';
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
export class HomeComponent implements OnInit, OnDestroy {
  protected router = inject(Router);
  protected bluetoothService = inject(BluetoothService);

  label = '';
  private dataSubscription: Subscription | undefined;

  navigateToDetails(id: string) {
    this.router.navigate(['/details', id]);
  }

  arduinos = [
    { id: '1', name: 'Arduino 1', status: 'Connected' },
    { id: '2', name: 'Arduino 2', status: 'Connected' },
    { id: '3', name: 'Arduino 3', status: 'Disconnected' },
  ];

  ngOnInit(): void {
    this.dataSubscription = this.bluetoothService.data$.subscribe(
      (label) => (this.label = label)
    );
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

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
