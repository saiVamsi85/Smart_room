#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// WIFI
const char *ssid = "YOUR_WIFI_NAME";
const char *password = "YOUR_WIFI_PASSWORD";

// BACKEND URL
const char *serverUrl = "http://172.22.102.188:3000/data";

// DHT SETUP
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// PINS
#define LDR_PIN 34
#define PIR_PIN 27

void setup()
{
    Serial.begin(115200);

    dht.begin();
    pinMode(PIR_PIN, INPUT);

    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnected!");
}

void loop()
{

    if (WiFi.status() == WL_CONNECTED)
    {

        float temp = dht.readTemperature(); // °C
        float hum = dht.readHumidity();     // %

        int lightRaw = analogRead(LDR_PIN); // 0–4095
        int motion = digitalRead(PIR_PIN);  // 0/1

        // Optional: scale light to your 0–3000 range
        int light = map(lightRaw, 0, 4095, 0, 3000);

        if (isnan(temp) || isnan(hum))
        {
            Serial.println("Failed to read DHT");
            return;
        }

        // JSON payload
        String json = "{";
        json += "\"temp\":" + String(temp, 2) + ",";
        json += "\"hum\":" + String(hum, 2) + ",";
        json += "\"light\":" + String(light) + ",";
        json += "\"motion\":" + String(motion);
        json += "}";

        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        int response = http.POST(json);

        Serial.println("Sent: " + json);
        Serial.println("Response: " + String(response));

        http.end();
    }

    delay(15000); // same as your simulator
}