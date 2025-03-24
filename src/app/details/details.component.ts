import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, ReplaySubject, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TimestampedLog } from '../types/timestamp.interface';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-details',
  imports: [MatCardModule, AsyncPipe, CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  protected bluetoothService = inject(BluetoothService);
  protected intakeMedicineLog = new BehaviorSubject<TimestampedLog[]>([]);

  public showLogs = false;
  currentDate = new Date();

  ngOnInit(): void {
    this.bluetoothService.data$
      .pipe(
        filter((data) => data === Classification.INTAKE_MEDICINE),
        tap((data) => {
          this.intakeMedicineLog.next([
            { timestamp: new Date(), log: data },
            ...this.intakeMedicineLog.getValue(),
          ]);
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

  wasMorningMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(this.currentDate.setHours(8, 0, 0, 0)),
      new Date(this.currentDate.setHours(9, 0, 0, 0))
    );
  }

  wasNoonMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(this.currentDate.setHours(11, 0, 0, 0)),
      new Date(this.currentDate.setHours(12, 0, 0, 0))
    );
  }

  wasEveningMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(this.currentDate.setHours(17, 0, 0, 0)),
      new Date(this.currentDate.setHours(18, 0, 0, 0))
    );
  }

  morningMedicineDue(): boolean {
    return (
      this.hasTimeframePassed(
        new Date(this.currentDate.setHours(9, 0, 0, 0))
      ) && !this.wasMorningMedicineTaken()
    );
  }

  noonMedicineDue(): boolean {
    return (
      this.hasTimeframePassed(
        new Date(this.currentDate.setHours(12, 0, 0, 0))
      ) && !this.wasNoonMedicineTaken()
    );
  }

  eveningMedicineDue(): boolean {
    return (
      this.hasTimeframePassed(
        new Date(this.currentDate.setHours(18, 0, 0, 0))
      ) && !this.wasEveningMedicineTaken()
    );
  }

  private isLogAvailableForTimeframe(start: Date, end: Date): boolean {
    return this.intakeMedicineLog.getValue().some((log) => {
      return log.timestamp >= start && log.timestamp <= end;
    });
  }

  hasTimeframePassed(end: Date): boolean {
    return this.currentDate > end;
  }
}
