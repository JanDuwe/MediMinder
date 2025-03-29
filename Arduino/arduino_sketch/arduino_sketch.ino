/* Edge Impulse Arduino examples
 * Copyright (c) 2021 EdgeImpulse Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* Includes ---------------------------------------------------------------- */
#include <MediMinder_inferencing.h>
#include <Arduino_LSM9DS1.h>
#include <ArduinoBLE.h>

/* Constant defines -------------------------------------------------------- */
#define CONVERT_G_TO_MS2    9.80665f // Conversion factor from g (Earth's gravity) to m/s^2

/* Private variables ------------------------------------------------------- */
static bool debug_nn = false; // Debug flag for neural network output (e.g., feature generation)
static uint32_t run_inference_every_ms = 2000; // Interval (in ms) for inference execution
static rtos::Thread inference_thread(osPriorityLow); // Thread for background inference
static float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 }; // Buffer for raw data from IMU
static float inference_buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE]; // Buffer for inference
static char bleData[256] = ""; // Stores the current classification label

BLEService imuService("4fafc201-1fb5-459e-8fcc-c5c9c331914b"); // BLE Service UUID
BLECharacteristic imuCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8", BLERead | BLENotify, 256); // BLE Characteristic UUID

bool previousConnectionState = false; // Stores the previous connection state

/* Forward declaration */
void run_inference_background(); // Forward declaration of the background inference function

/**
* @brief      Arduino setup function
*/
void setup()
{
  // Initialize serial communication
  Serial.begin(115200);

  // Configure LED pins as outputs
  pinMode(LEDR, OUTPUT), pinMode(LEDG, OUTPUT), pinMode(LEDB, OUTPUT);
  Serial.println("Edge Impulse Inferencing Demo");

  // Initialize the IMU sensor
  if (!IMU.begin()) {
      ei_printf("Failed to initialize IMU!\r\n");
  }
  else {
      ei_printf("IMU initialized\r\n");
  }

  // Initialize Bluetooth Low Energy (BLE)
  if (!BLE.begin()) {
    Serial.println("BLE failed to Initiate!");
    while (1); // Infinite loop on error
  } else{
    BLE.setLocalName("MediMinderBLE"); // Sets the BLE device name
    BLE.setAdvertisedService(imuService); // Adds the service
    imuService.addCharacteristic(imuCharacteristic); // Adds the characteristic
    BLE.addService(imuService); // Adds the service to the BLE server
    BLE.advertise(); // Starts advertising the BLE device

    Serial.println("Bluetooth device is now active.");
  }

  // Check if the number of raw samples per frame is correct
  if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {
      ei_printf("ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME should be equal to 6 (3 acceleration and 3 gyroscope axes)\n");
      return;
  }

  // Start the background inference thread
  inference_thread.start(mbed::callback(&run_inference_background));

  // Initialize LEDs to OFF
  digitalWrite(LEDR, HIGH), digitalWrite(LEDG, HIGH), digitalWrite(LEDB, HIGH);
}

/**
* @brief      Printf function uses vsnprintf and output using Arduino Serial
*
* @param[in]  format     Variable argument list
*/
void ei_printf(const char *format, ...) {
   static char print_buf[1024] = { 0 };

   va_list args;
   va_start(args, format);
   int r = vsnprintf(print_buf, sizeof(print_buf), format, args);
   va_end(args);

   if (r > 0) {
       Serial.write(print_buf);
   }
}

/**
 * @brief      Run inferencing in the background.
 */
void run_inference_background()
{
  // Begin data acquisition and inference
  ei_printf("Sampling...\n");
  delay((EI_CLASSIFIER_INTERVAL_MS * EI_CLASSIFIER_RAW_SAMPLE_COUNT) + 100);

  while (1) {
    // Copy the buffer
    memcpy(inference_buffer, buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE * sizeof(float));

    // Convert the raw data buffer into a signal for classification
    signal_t signal;
    int err = numpy::signal_from_buffer(inference_buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    if (err != 0) {
        ei_printf("Failed to create signal from buffer (%d)\n", err);
        return;
    }

    // Run the classifier
    ei_impulse_result_t result = { 0 };

    err = run_classifier(&signal, &result, debug_nn);
    if (err != EI_IMPULSE_OK) {
        ei_printf("ERR: Failed to run classifier (%d)\n", err);
        return;
    }

    // Print the predictions
    ei_printf("Predictions (DSP: %d ms., Classification: %d ms., Anomaly: %d ms.):\n",
        result.timing.dsp, result.timing.classification, result.timing.anomaly);
    ei_printf("Classification results:\n");

    // Check BLE connection status before the loop
    BLEDevice central = BLE.central();
    bool currentConnectionState = central && central.connected();

    // Create BLE-Data
    strcpy(bleData, "{");

    // Find label with the highest accuracy
    float maxAccuracy = 0;
    int maxAccuracyIndex = 0;
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
      if (result.classification[ix].value > maxAccuracy) {
        maxAccuracy = result.classification[ix].value;
        maxAccuracyIndex = ix;
      }
    }
    char labelPart[256];
    snprintf(labelPart, sizeof(labelPart), "\"label\":\"%s\"", result.classification[maxAccuracyIndex].label);
    strcat(bleData, labelPart);

    // Add all labels and accuracies
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) { 
      char accuracyPart[256];
      char labelBuffer[256];
      strcpy(labelBuffer, result.classification[ix].label);
      //Replace spaces with underscores
      for(int i = 0; labelBuffer[i] != '\0'; i++){
        if(labelBuffer[i] == ' '){
          labelBuffer[i] = '_';
        }
      }
      snprintf(accuracyPart, sizeof(accuracyPart), ",\"accuracy_%s\":%.4f", labelBuffer, result.classification[ix].value); 
      strcat(bleData, accuracyPart); 
      ei_printf("%s: %f\n", result.classification[ix].label, result.classification[ix].value);
    }

    strcat(bleData, "}");

    ei_printf("Anomaly prediction: %f\n", result.anomaly);

    // Send BLE data if connected
    if(currentConnectionState){
      imuCharacteristic.writeValue(bleData);
      Serial.println("BLE Sending: ");
      Serial.println(bleData);
    }

    // LED control based on classification
    float intake_medicine_accuracy = 0;
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
      if (strcmp(result.classification[ix].label, "intake medicine") == 0) {
        intake_medicine_accuracy = result.classification[ix].value;
        break;
      }
    }
    if (intake_medicine_accuracy > 0.9) {
      digitalWrite(LEDR, HIGH), digitalWrite(LEDG, HIGH), digitalWrite(LEDB, LOW);
    } else{
      digitalWrite(LEDR, HIGH), digitalWrite(LEDG, HIGH), digitalWrite(LEDB, HIGH);
    }

    // Check BLE connection status
    if (currentConnectionState && !previousConnectionState) {
      Serial.print("Connected to central: ");
      Serial.println(central.address());
      digitalWrite(LEDR, LOW), digitalWrite(LEDG, LOW), digitalWrite(LEDB, LOW);
      delay(2000);
      digitalWrite(LEDR, HIGH), digitalWrite(LEDG, HIGH), digitalWrite(LEDB, HIGH);
    }

    previousConnectionState = currentConnectionState;

    delay(run_inference_every_ms); // Wait until next inference
  }
}

/**
* @brief      Get data and run inferencing
*
* @param[in]  debug  Get debug info if true
*/
void loop()
{
    while (1) {
        // Calculate the next time point for data acquisition
        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);

        // Roll the buffer -6 points so we can overwrite the last one
        numpy::roll(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, -6);

        // Read acceleration and gyroscope data from IMU
        IMU.readAcceleration(
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 6],
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 5],
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 4]
        );
        IMU.readGyroscope(
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3],
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 2],
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 1]
        );

        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 6] *= CONVERT_G_TO_MS2; // Convert acceleration X-axis from g to m/s^2
        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 5] *= CONVERT_G_TO_MS2; // Convert acceleration Y-axis from g to m/s^2
        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 4] *= CONVERT_G_TO_MS2; // Convert acceleration Z-axis from g to m/s^2

        // Wait for the next tick
        uint64_t time_to_wait = next_tick - micros();
        delay((int)floor((float)time_to_wait / 1000.0f));
        delayMicroseconds(time_to_wait % 1000);
    }
}

#if !defined(EI_CLASSIFIER_SENSOR) || EI_CLASSIFIER_SENSOR != EI_CLASSIFIER_SENSOR_FUSION
#error "Invalid model for current sensor" // Error if the model was not created for sensor fusion
#endif