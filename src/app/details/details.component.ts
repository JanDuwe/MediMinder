import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Log, TimestampedLog } from '../types/interfaces';
import { HeaderComponent } from '../header/header.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-details',
  imports: [
    MatCardModule,
    AsyncPipe,
    CommonModule,
    HeaderComponent,
    MatTableModule,
    DatePipe,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  protected bluetoothService = inject(BluetoothService);
  protected intakeMedicineLog = new BehaviorSubject<TimestampedLog[]>([]);

  public showLogs = false;
  currentDate = new Date();
  dataSource = new MatTableDataSource<TimestampedLog>();
  displayedColumns: string[] = [
    'ID',
    'date',
    'time',
    'label',
    'accuracyIntakeMedicine',
    'accuracySlide',
    'accuracyPutAway',
    'accuracyMotionless',
  ];

  ngOnInit(): void {
    this.bluetoothService.data$
      .pipe(
        filter(
          (data) =>
            data.label === Classification.INTAKE_MEDICINE ||
            data.label === Classification.SLIDE
        ),
        tap((data) => {
          this.intakeMedicineLog.next([
            { timestamp: new Date(), ...data } as TimestampedLog,
            ...this.intakeMedicineLog.getValue(),
          ]);
        })
      )
      .subscribe();

    this.intakeMedicineLog.subscribe((logs) => {
      this.dataSource.data = logs;
    });
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
        22,
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
      return (
        log.timestamp >= start &&
        log.timestamp <= end &&
        log.label === Classification.INTAKE_MEDICINE
      );
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

  getMorningIntakeTime(): string {
    const logs = this.intakeMedicineLog.getValue();
    const morningLogs = logs.filter((log) => {
      const hours = log.timestamp.getHours();
      return hours >= 8 && hours < 9;
    });

    if (morningLogs.length > 0) {
      const firstLogTime = morningLogs[0].timestamp;
      return firstLogTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      return '---';
    }
  }

  getNoonIntakeTime(): string {
    const logs = this.intakeMedicineLog.getValue();
    const noonLogs = logs.filter((log) => {
      const hours = log.timestamp.getHours();
      return hours >= 11 && hours < 12;
    });

    if (noonLogs.length > 0) {
      const firstLogTime = noonLogs[0].timestamp;
      return firstLogTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      return '---';
    }
  }

  getEveningIntakeTime(): string {
    const logs = this.intakeMedicineLog.getValue();
    const eveningLogs = logs.filter((log) => {
      const hours = log.timestamp.getHours();
      return hours >= 17 && hours < 22;
    });

    if (eveningLogs.length > 0) {
      const firstLogTime = eveningLogs[0].timestamp;
      return firstLogTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      return '---';
    }
  }
}
