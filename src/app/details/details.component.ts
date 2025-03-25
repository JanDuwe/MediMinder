import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TimestampedLog } from '../types/timestamp.interface';

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
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        8,
        0,
        0,
        0
      ),
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        9,
        0,
        0,
        0
      )
    );
  }

  wasNoonMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        11,
        0,
        0,
        0
      ),
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        14,
        0,
        0,
        0
      )
    );
  }

  wasEveningMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        17,
        0,
        0,
        0
      ),
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        18,
        0,
        0,
        0
      )
    );
  }

  morningMedicineDue(): boolean {
    return this.hasTimeframePassed(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        9,
        0,
        0,
        0
      )
    );
  }

  noonMedicineDue(): boolean {
    return this.hasTimeframePassed(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        14,
        0,
        0,
        0
      )
    );
  }

  eveningMedicineDue(): boolean {
    return this.hasTimeframePassed(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        18,
        0,
        0,
        0
      )
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

  getMorningClass(): string {
    if (this.wasMorningMedicineTaken()) {
      return 'taken';
    } else if (this.morningMedicineDue() && !this.wasMorningMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }

  getNoonClass(): string {
    if (this.wasNoonMedicineTaken()) {
      return 'taken';
    } else if (this.noonMedicineDue() && !this.wasNoonMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }

  getEveningClass(): string {
    if (this.wasEveningMedicineTaken()) {
      return 'taken';
    } else if (this.eveningMedicineDue() && !this.wasEveningMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }
}
