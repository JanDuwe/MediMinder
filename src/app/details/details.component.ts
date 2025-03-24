import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, ReplaySubject, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe } from '@angular/common';
import { TimestampedLog } from '../types/timestamp.interface';

@Component({
  selector: 'app-details',
  imports: [MatCardModule, AsyncPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  protected bluetoothService = inject(BluetoothService);
  protected intakeMedicineLog = new BehaviorSubject<TimestampedLog[]>([]);

  public showLogs = false;

  ngOnInit(): void {
    this.bluetoothService.data$
      .pipe(
        filter((data) => data === Classification.INTAKE_MEDICINE),
        tap((data) => {
          this.intakeMedicineLog.next(
            [{ timestamp: new Date(), log: data },
              ...this.intakeMedicineLog.getValue()
            ],
          );
        })
      )
      .subscribe();
  }

  viewFullLog(): void {
    this.showLogs = true;
  }

  exitFullLog(): void {
    this.showLogs = false;
  }
}
