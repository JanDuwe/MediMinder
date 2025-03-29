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

/*
The details component shows detailed logging information about the data received from the Arduino device.
It displays the logs in a table format and allows the user to view the full log or add entries manually.
Additionally, it provides information about the intake of medicine at different times of the day.
It also includes methods to check if the medicine was taken at specific times and if the time for taking the medicine has passed.
This way, the color of the elements in the UI can be changed based on the status of the medicine intake.
The component uses Angular Material for styling and layout.
*/

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

  /*
  The ngOnInit lifecycle hook is called after the component is initialized.
  It subscribes to the data$ observable from the BluetoothService and filters the data based on the label.
  Currently, the Motionless classification is being filtered out.
  The filtered data is then pushed to the intakeMedicineLog BehaviorSubject.
  A subscription is also created to update the dataSource of the table with the logs.
  The dataSource is a MatTableDataSource which is used to display the logs in a table format.
  The dataSource is updated based on the showLogs boolean value, so it can show either the full log or just the last 5 entries.
  */
  ngOnInit(): void {
    this.bluetoothService.data$
      .pipe(
        filter(
          (data) =>
            data.label === Classification.INTAKE_MEDICINE ||
            data.label === Classification.SLIDE ||
            data.label === Classification.PUT_AWAY
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

  // Helper function to switch between full and partial log view
  viewFullLog(): void {
    this.showLogs = true;
    this.updateTableData(this.intakeMedicineLog.getValue());
  }

  // Helper function to switch between full and partial log view
  exitFullLog(): void {
    this.showLogs = false;
    this.updateTableData(this.intakeMedicineLog.getValue());
  }

  // Helper function to switch between full and partial log view
  updateTableData(logs: TimestampedLog[]) {
    this.dataSource.data = this.showLogs ? logs : logs.slice(0, 5);
  }

  // Helper function to add an entry manually, this was mostly used for testing purposes but also part of the demonstration
  addEntryManually(label: string, uhrzeit: string): void {
    let enumlabel = label as Classification;

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

  // Helper function to check if the medicine was taken in the morning
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

  // Helper function to check if the medicine was taken in the noon
  wasNoonMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        10,
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

  // Helper function to check if the medicine was taken in the evening
  wasEveningMedicineTaken(): boolean {
    return this.isLogAvailableForTimeframe(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        18,
        0,
        0,
        0
      ),
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        19,
        0,
        0,
        0
      )
    );
  }

  // Helper function to check if the time for taking the medicine has passed in the morning
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

  // Helper function to check if the time for taking the medicine has passed in the noon
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

  // Helper function to check if the time for taking the medicine has passed in the evening
  eveningMedicineDue(): boolean {
    return this.hasTimeframePassed(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate(),
        19,
        0,
        0,
        0
      )
    );
  }

  // Helper function to check if a log is available for a specific timeframe
  // This is used to check if the medicine was taken in the morning, noon or evening
  private isLogAvailableForTimeframe(start: Date, end: Date): boolean {
    return this.intakeMedicineLog.getValue().some((log) => {
      return (
        log.timestamp >= start &&
        log.timestamp <= end &&
        log.label === Classification.INTAKE_MEDICINE
      );
    });
  }

  // Helper function to check if the time for taking the medicine has passed
  hasTimeframePassed(end: Date): boolean {
    return this.currentDate > end;
  }

  // Helper function to get the class for the morning medicine intake
  // This is used to change the color of the element in the UI based on the status of the medicine intake
  getMorningClass(): string {
    if (this.wasMorningMedicineTaken()) {
      return 'taken';
    } else if (this.morningMedicineDue() && !this.wasMorningMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }

  // Helper function to get the class for the noon medicine intake
  // This is used to change the color of the element in the UI based on the status of the medicine intake
  getNoonClass(): string {
    if (this.wasNoonMedicineTaken()) {
      return 'taken';
    } else if (this.noonMedicineDue() && !this.wasNoonMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }

  // Helper function to get the class for the evening medicine intake
  // This is used to change the color of the element in the UI based on the status of the medicine intake
  getEveningClass(): string {
    if (this.wasEveningMedicineTaken()) {
      return 'taken';
    } else if (this.eveningMedicineDue() && !this.wasEveningMedicineTaken()) {
      return 'not-taken';
    } else {
      return '';
    }
  }

  // Helper function to get the time of the morning medicine intake
  // This is used to display the time of the medicine intake in the UI, as long as it matches the intake window
  getMorningIntakeTime(): string {
    let logs = this.intakeMedicineLog.getValue();
    let morningLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      let minutes = log.timestamp.getMinutes();
      return (
        hours >= 7 &&
        hours <= 8 &&
        (hours !== 8 || minutes <= 0) &&
        log.label === Classification.INTAKE_MEDICINE
      );
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

  // Helper function to get the time of the noon medicine intake
  // This is used to display the time of the medicine intake in the UI, as long as it matches the intake window
  getNoonIntakeTime(): string {
    let logs = this.intakeMedicineLog.getValue();
    let noonLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      let minutes = log.timestamp.getMinutes();
      return (
        hours >= 10 &&
        hours <= 14 &&
        (hours !== 14 || minutes <= 0) &&
        log.label === Classification.INTAKE_MEDICINE
      );
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

  // Helper function to get the time of the evening medicine intake
  // This is used to display the time of the medicine intake in the UI, as long as it matches the intake window
  getEveningIntakeTime(): string {
    let logs = this.intakeMedicineLog.getValue();
    let eveningLogs = logs.filter((log) => {
      let hours = log.timestamp.getHours();
      let minutes = log.timestamp.getMinutes();
      return (
        hours >= 18 &&
        hours <= 19 &&
        (hours !== 19 || minutes <= 0) &&
        log.label === Classification.INTAKE_MEDICINE
      );
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
