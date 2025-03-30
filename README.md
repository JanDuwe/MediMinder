# 1. Projektbeschreibung

In diesem GitHub Repository ist die Projektabgabe von Alice Kitchkin, Moritz Eichhorn und Jan Duwe hinterlegt. 

MediMinder ist ein Projekt zur Nachvollziehbarkeit der Medikamenteneinnahme. Dabei wird ein Arduino Nano 33 BLE Sense an einer Medikamentenpackung montiert. Mithilfe  der Inertial Measurement Unit des Arduinos (Beschleunigungssensor und Gyroskop) können nun verschiedene Bewegungen an der Medikamentenpackung gemessen werden. Im Rahmen des Projekts wurde zusätzlich die Plattform [Edge Impulse](https://edgeimpulse.com/) genutzt, um ein TinyML zur Klassifizierung der Bewegungen am Arduino zu entwickeln und diese einordnen zu können. Die klassifizierten Daten werden mithilfe von Bluetooth Low Energy übertragen und auf einer Angular WebApp abgebildet. Die WebApp wird auf GitHub Pages gehostet und ist unter [janduwe.github.io/MediMinder/details](https://janduwe.github.io/MediMinder/details) erreichbar. 


# 2. Verwendete Hardware
## 2.1 Arduino Nano BLE 33 Sense
Für das Projekt wurden die Daten mit Hilfe der Inertial Measurement Unit erfasst. Dafür wurden die Bewegungsmuster mit einem Beschleunigungssensor und Gyroskop verfolgt. Zuden wurde die Bluetooth Low Energy-Funktionalität des Arduinos verwendet um mit der WebApp zu kommunizieren.
## 2.2 USB A zu USB Mikro Kabel
Das Kabel war für die Stromversorgung des Arduinos und das Flashen der Firmware notwendig.

# 3. Verwendete Software
## 3.1 Arduino IDE
Die Arduino IDE diente der Erstellung, Bearbeitung und dem Flashen des Sketches. Zudem konnten über die IDE externe Bibliotheken eingebunden werden, die für die Hardwareinteraktion, BLE-Verbindung und Integration des TinyML-Modells erforderlich waren.
## 3.2 Edge Impulse Plattform
Auf der Plattform Edge Impulse wurde das TinyML-Modell entwickelt, welches die Grundlage der Bewegungserkennung bildet. Der Entwicklungsprozess umfasste die Schritte: Datenerfassung, Datenverarbeitung sowie Training und Bereitstellung des Modells.
## 3.3 Microsoft Edge
Um die Kommunikation zwischen dem Arduino Nano 33 BLE Sense und der WebApp gewährleisten zu können, war ein Webbrowser erforderlich, der "Bluetooth Low Energy" unterstützt.
Damit der Arduino mit der WebApp kommunizieren konnte, war es wichtig einen Browser zu verwenden, welcher Bluetooth Low Energy unterstützt. Die Tests der WebApp wurden hauptsächlich mit Microsoft Edge durchgeführt, alternativ können jedoch auch Browser wie  bspw. Google Chrome verwendet werden.
## 3.4 Visual Studio Code
Visual Studio Code diente als Entwicklungsumgebung für die Angular WebApp, die Bereitstellung auf GitHub Pages und die Erstellung der Dokumentation.
 
# 4. Umfang GitHub

In diesem GitHub-Repository sind sowohl der Quellcode zum klassifizieren der Daten auf dem Arduino, als auch für die WebApp hinterlegt. 
Das Verzeichnis für den Quellcode des Arduinos befindet sich unter [/MediMinder/Arduino/](https://github.com/JanDuwe/MediMinder/tree/main/Arduino), wobei das Verzeichnis "libraries" Erweiterungen enthält, die die Bluetooth Konnektivität des Arduinos bereitstellt, die Interaktion mit dem IMU-Sensor ermöglicht und die Klassifizierung über Edge Impulse bereitstellt. Das Verzeichnis "arduino_sketch" enthält den selbstgeschriebenen Quellcode, der zum flashen des Arduinos benutzt wurde. 
Im Verzeichnis [/MediMinder/src/](https://github.com/JanDuwe/MediMinder/tree/main/src/) ist der Quellcode der Angular WebApp zu finden. Unter dem Unterordner "app" ist die WebApp selbst, in dem Verzeichnis "services" ist die Logik zur Bluetooth verbindung hinterlegt.

# 5. Quellen 
Für die Umsetzung des Projekts wurden externe Quellen herangezogen:
1. Edge Impulse Dokumentation: [docs.edgeimpulse.com/docs](https://docs.edgeimpulse.com/docs)
2. Beispielprojekt zur Umsetzung von BLE auf Arduino-Seite: [github.com/LudwigStumpp](https://github.com/LudwigStumpp/arduino-workout-classification/tree/main)
3. Web-Bluetooth API zur Umsetzung von BLE auf WebApp-Seite: [developer.mozilla.org](https://developer.mozilla.org/de/docs/Web/API/Web_Bluetooth_API)
4. Grundlagen für Angular Webdevelopment: [angular.dev](https://angular.dev/tutorials/learn-angular)
5. Deployment Guide für Angular WebApps: [medium.com](https://senoritadeveloper.medium.com/deploy-an-angular-application-to-github-pages-65573194595a)
6. Beispiel zum Lesen von kontinuierlichen Bewegungsdaten: [Arduino Beispielcode](https://github.com/JanDuwe/MediMinder/blob/main/Arduino/libraries/MediMinder_inferencing/examples/nano_ble33_sense/nano_ble33_sense_accelerometer_continuous/nano_ble33_sense_accelerometer_continuous.ino)