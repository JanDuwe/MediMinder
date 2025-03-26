import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BluetoothService } from '../../services/bluetooth.service';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { Classification } from '../types/classification.enum';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Log, TimestampedLog } from '../types/interfaces';
import { HeaderComponent } from '../header/header.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-details',
  imports: [
    MatCardModule,
    AsyncPipe,
    CommonModule,
    HeaderComponent,
    MatTableModule,
    DatePipe,
    MatButtonModule,
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
    'date',
    'time',
    'label',
    'accuracyIntakeMedicine',
    'accuracySlide',
    'accuracyPutAway',
    'accuracyMotionless',
  ];

  label: string = '';
  uhrzeit: string = '';

  Classification = Classification;

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
      this.dataSource.data = this.showLogs ? logs : logs.slice(0, 5);
    });
  }

  viewFullLog(): void {
    this.showLogs = true;
    this.updateTableData(this.intakeMedicineLog.getValue());
  }

  exitFullLog(): void {
    this.showLogs = false;
    this.updateTableData(this.intakeMedicineLog.getValue());
  }

  updateTableData(logs: TimestampedLog[]) {
    this.dataSource.data = this.showLogs ? logs : logs.slice(0, 5);
  }

  addEntryManually(label: string, uhrzeit: string): void {
    let enumlabel = label as Classification;
    console.log('Uhrzeit: ' + uhrzeit);
    for (let i = 0; i < uhrzeit.split(':').length; i++) {
      console.log('Uhrzeit[' + i + ']: ' + uhrzeit.split(':')[i]);
    }
    const out: TimestampedLog = {
      label: enumlabel,
      timestamp: new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        Number(uhrzeit.split(':')[0]),
        Number(uhrzeit.split(':')[1]),
        Number(uhrzeit.split(':')[2]),
        0
      ),
      accuracy_intake_medicine: 0,
      accuracy_motionless: 0,
      accuracy_put_away: 0,
      accuracy_slide: 0,
    };
    this.intakeMedicineLog.next([out, ...this.intakeMedicineLog.getValue()]);
  }

  wasMorningMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        7,
        0,
        0,
        0
      ),
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        8,
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
        12,
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
        15,
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
        8,
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
        12,
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
        22,
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
    let logs = this.intakeMedicineLog.getValue();
    let morningLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      return hours >= 7 && hours <= 8;
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
    let logs = this.intakeMedicineLog.getValue();
    let noonLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      return hours >= 11 && hours <= 12;
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
    let logs = this.intakeMedicineLog.getValue();
    let eveningLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      return hours >= 15 && hours <= 22;
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
