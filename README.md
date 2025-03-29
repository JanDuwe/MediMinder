# 1. Projektbeschreibung

In diesem GitHub Repository ist die Projektabgabe von Alice Kitchkin, Moritz Eichhorn und Jan Duwe hinterlegt. 

MediMinder ist ein Projekt zur Nachvollziehbarkeit der Medikamenteneinnahme. Dabei wird ein Arduino Nano 33 BLE Sense an einer Medikamentenpackung montiert. Mithilfe  der "Inertial Measurement Unit" des Arduinos (Beschleunigungssensor und Gyroskop) können nun verschiedene Bewegungen an der Medikamentenpackung gemessen werden. Im Rahmen des Projekts wurde zusätzlich die Plattform [Edge Impulse](https://edgeimpulse.com/) genutzt, um ein TinyML zur Klassifizierung der Bewegungen am Arduino zu entwickeln und diese einordnen zu können. Die klassifizierten Daten werden mithilfe von Bluetooth Low Energy übertragen und auf einer Angular WebApp abgebildet.


# 2. Verwendete Hardware
## 2.1 Arduino Nano BLE 33 Sense
Für das Projekt wurden die Daten mit Hilfe der  "Inertial Measurement Unit" erfasst. Dafür wurden die Bewegungsmuster mit einem Beschleunigungssensor und Gyroskop verfolgt. Zuden wurde die "Bluetooth Low Energy"-Funktionalität des Arduinos verwendet um mit der WebApp zu kommunizieren.
## 2.2 USB A zu USB Mikro Kabel
Das Kabel war notwendig um den Arduino mit Strom zu versorgen und die Firmware flashen zu können.

## 3. Verwendete Software
# 3.1 Arduino IDE
In der Arduino IDE wurde die Sketch-Datei für den Arduino geschrieben. Dies ermöglichte die Einbindung externer Bibliotheken. Zudem wurde dort die Firmware auf dem Arduino deployed.
# 3.2 Edge Impulse Plattform
Edge Impulse wurde verwendet um das TinyML für unser Projekt entwickeln zu können. Dieser Prozess gliederte sich in die Schritte Datenerfassung, Datenverarbeitung, Training und Bereitstellung des Modells auf.
# 3.3 Microsoft Edge
Damit der Arduino mit der WebApp kommunizieren konnte, war es wichtig einen Browser zu verwenden, welcher "Bluetooth Low Energy" unterstützt. Die Tests der WebApp fanden daher in Microsoft Edge statt, jedoch können auch alternative Browser wie Google Chrome verwendet werden.
# 3.4 Visual Studio Code
Als Entwicklungsumgebung für  die WebApp sowie das Deployment auf "Github Pages" und die Erstellung der Dokumentation wurde Visual Studio Code verwendet. 


# 4. Umfang GitHub

In diesem GitHub-Repository sind sowohl der Quellcode zum klassifizieren der Daten auf dem Arduino, als auch für die WebApp hinterlegt. 
Das Verzeichnis für den Quellcode des Arduinos befindet sich unter [/MediMinder/Arduino/](https://github.com/JanDuwe/MediMinder/tree/main/Arduino), wobei das Verzeichnis "libraries" Erweiterungen enthält, die die Bluetooth Konnektivität des Arduinos bereitstellt, die Interaktion mit dem IMU-Sensor ermöglicht und die Klassifizierung über Edge Impulse bereitstellt. Das Verzeichnis "arduino_sketch" enthält den selbstgeschriebenen Quellcode, der zum flashen des Arduinos benutzt wurde. 
Im Verzeichnis [/MediMinder/src/](https://github.com/JanDuwe/MediMinder/tree/main/src/) ist der Quellcode der Angular WebApp zu finden. Unter dem Unterordner "app" ist die WebApp an sich, in dem Verzeichnis "services" ist die Logik zur Bluetooth verbindung hinterlegt.

# 5. Quellen 

tbc