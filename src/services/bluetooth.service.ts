/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Log } from '../app/types/interfaces';

/*
This service is a singleton class that manages the Bluetooth connection and data transfer from the Arduino device.
It handles the connection to the Bluetooth device, the GATT server, and the characteristics of the service. 
*/

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  public connectionStatus$ = new BehaviorSubject<boolean>(false);
  private newValueObservable = new BehaviorSubject<number | null>(null);
  private SERVICE_UUID: BluetoothServiceUUID =
    '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  private CHARACTERISTIC_UUID: BluetoothCharacteristicUUID =
    'beb5483e-36e1-4688-b7f5-ea07361b26a8';
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private static instance: BluetoothService;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  public data$ = new Subject<Log>();

  private constructor() {}

  /*
  This method is used to get the singleton instance of the BluetoothService class, thus acting like a constructor.
  It creates a new instance if it doesn't exist yet.
  */
  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  setServiceUUID(uuid: string) {
    this.SERVICE_UUID = uuid;
  }

  timeoutPromise(milliseconds: number): Promise<void> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            'Timeout: Die Verbindung konnte nicht innerhalb der vorgegebenen Zeit hergestellt werden.'
          )
        );
      }, milliseconds);
    });
  }

  /*
  This function is used to connect to the Bluetooth device.
  It requests the user to select a Bluetooth device and then connects to it.
  */
  async tryConnect(): Promise<boolean> {
    return navigator.bluetooth
      .requestDevice(
        {
          acceptAllDevices: true, //filters: [{ namePrefix: 'MediMinderBLE' }],
          optionalServices: [this.SERVICE_UUID],
        }
        // filters: [{ services: [this.SERVICE_UUID] }]
      )
      .then(async (selectedDevice) => {
        console.log('Gerät ausgewählt:', selectedDevice);
        this.device = selectedDevice; 
        this.device.addEventListener(
          'gattserverdisconnected',
          this.onDisconnected.bind(this)
        );
        if (!this.device.gatt) {
          throw new Error('GATT Server nicht verfügbar.');
        }
        try {
          const connServer = await Promise.race([
            this.device.gatt.connect(),
            this.timeoutPromise(10000),
          ]);
          if (!connServer) {
            throw new Error(
              'Timeout: Die Verbindung konnte nicht innerhalb der vorgegebenen Zeit hergestellt werden.'
            );
          } else {
            return connServer;
          }
        } catch (error) {
          console.error(error);
          throw new Error('Verbindungsfehler oder Timeout');
        }
      })
      .then((connectedServer) => {
        this.server = connectedServer; // Speichern des Servers für späteren Gebrauch
        console.log('Verbunden mit dem GATT-Server:', this.server);
        console.log(this.server.getPrimaryServices());
        return this.server.getPrimaryService(this.SERVICE_UUID);
      })
      .then((service) => service.getCharacteristic(this.CHARACTERISTIC_UUID))
      .then((characteristic) => {
        characteristic.startNotifications();
        characteristic.addEventListener(
          'characteristicvaluechanged',
          (event) => {
            const value = (event.target as BluetoothRemoteGATTCharacteristic)
              .value;

            if (value) {
              // Annahme: Die Daten werden als JSON empfangen
              const decoder = new TextDecoder('utf-8');
              let decodedString = decoder.decode(value);

              if (
                decodedString.startsWith('"') &&
                decodedString.endsWith('"')
              ) {
                decodedString = decodedString.slice(1, -1);
              }

              const jsonData: Log = JSON.parse(decodedString);
              this.data$.next(jsonData);
              console.log('Received json value:', { jsonData });
            } else {
              console.error('No value received from Bluetooth characteristic.');
            }
          }
        );
        this.connectionStatus$.next(true);
        return true;
      })
      .catch((error) => {
        console.error('Connection failed:', error);
        return false;
      });
  }

  disconnect() {
    if (this.server && this.server.connected) {
      this.server.disconnect();
      console.log('Disconnected from the device.');
    } else {
      console.log('Device is already disconnected or was never connected.');
    }
  }

  isBluetoothSupported() {
    return 'bluetooth' in navigator;
  }

  isBluetoothEnabled() {
    return (navigator as any).bluetooth.getAvailability();
  }

  isBluetoothDeviceConnected() {
    return this.device && this.device.gatt && this.device.gatt.connected;
  }

  isBluetoothServiceAvailable() {
    return this.server && this.server.connected;
  }

  onDisconnected() {
    console.log('Die Verbindung wurde getrennt!');
    this.connectionStatus$.next(false);
  }

  //   subscribeToConnectionStatus(observer: Function) {
  //     this.connectionStatus$.subscribe(observer);
  //   }

  //   unsubscribeFromConnectionStatus(observer: Function) {
  //     this.connectionStatus$.unsubscribe(observer);
  //   }

  //   subscribeToNewValue(observer: Function) {
  //     this.newValueObservable.subscribe(observer);
  //   }

  //   unsubscribeFromNewValue(observer: Function) {
  //     this.newValueObservable.unsubscribe(observer);
  //   }
}
