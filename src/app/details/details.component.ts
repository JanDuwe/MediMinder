import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [MatCardModule, AsyncPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  protected bluetoothService = inject(BluetoothService);
  protected intakeMedicineLog = new BehaviorSubject<string[]>([]);

  ngOnInit(): void {
    this.bluetoothService.data$
      .pipe(
        filter((data) => data === Classification.INTAKE_MEDICINE),
        tap((data) => {
          this.intakeMedicineLog.next([
            data,
            ...this.intakeMedicineLog.getValue(),
          ]);
        })
      )
      .subscribe();
  }
}
