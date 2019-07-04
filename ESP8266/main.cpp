#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>            //Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     //Local WebServer used to serve the configuration portal
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager WiFi Configuration Magic    
// #include <Adafruit_AM2320.h>
#include <Adafruit_Sensor.h>
//READ DHT 11 temp
#include "DHT.h"

DHT dht;
float humidity =0;
float temperature = 0;

// Host URL for the API, do not change unless you move host
const String host = "agafh7et1a.execute-api.us-east-1.amazonaws.com";

// API Stage to use, see the ABB-IoT API in AWS API Gateway
const String stage = "iot";

// Warning: This fingerprint expires December 14th 2019.
// To update it, view the SSL certificate in your browser:
//  1. Go to the host URL
//    "https://agafh7et1a.execute-api.us-east-1.amazonaws.com/"
//  2. Click the lock icon near the URL field
//  3. View the certificate
//  4. Copy the SHA-1 Fingerprint value to this string
const char *fingerprint = "E6:8D:15:A0:C3:FD:67:F7:B2:DF:69:93:6C:80:A8:50:0C:85:EE:9A";

// HTTP response object
struct Response
{
  // HTTP status code
  int statusCode = -1;
  // Response message
  String payload = "";
};

// HTTPS client
WiFiClientSecure client;

// Important values from database
bool isRegistered = false;
int updateInterval = 1800;

// Query string for HTTP requests
String macQuery;

// Temperature and humidity sensor object
// Adafruit_AM2320 am2320 = Adafruit_AM2320();

// Prints the steps to register a device
void printRegisterGuide()
{
  Serial.println(" 1. Besök ABB IoT-webbsidan på http://abbiot.eu-north-1.elasticbeanstalk.com/");
  Serial.println(" 2. Logga in med din skol-email");
  Serial.print(" 3. Hitta denna enhet i den oregistrerade listan, MAC-addressen är ");
  Serial.print(WiFi.macAddress());
  Serial.println();
  Serial.println(" 4. Registrera den, och starta sedan om denna enhet");
}

void MeasureData(){

if (isnan(dht.getHumidity())) {
    Serial.println(F("Error reading temperature!"));
  }
  else
  {
     humidity = dht.getHumidity();
      Serial.print("Humidity: ");
      Serial.print(humidity, 1);
    Serial.println(F("%"));
  Serial.print("\t\t");
  }
  
  if (isnan(dht.getTemperature())) {
    Serial.println(F("Error reading temperature!"));
  }
  else
  {
      temperature = dht.getTemperature();
      Serial.print("Temperature: ");
  Serial.print(temperature, 1);
    Serial.println(F("°C"));
  Serial.print("\t\t");
  }

  
}


// Makes an HTTP request
// type: Request type (GET, PUT, POST, etc.)
// uri: Subdirectory
// query: Query string
// payload: Payload/Message in JSON format (Not for GET requests)
// Returns a Response object (see struct above)
Response makeRequest(String type, String uri, String query, String payload)
{
  // Connect to API host
  if(client.connect(host, 443))
  {
      Serial.println(host+type + " /" + stage + uri + "?" + query + " HTTP/1.1");
    Serial.println(payload);
    // Writing HTTP request
    client.println(type + " /" + stage + uri + "?" + query + " HTTP/1.1");
    client.println("Host: " + host);
    client.println("Connection: close");
    
    // If there's a payload, include content-length
    if(payload.length() > 0)
    {
      client.println("Content-Type: application/json");
      client.print("Content-Length: ");
      client.println(payload.length());
      client.println();
      client.println(payload);
      client.println();
    }
    else
    {
      client.println();
    }

    // An empty println means the end of the request

    // Placeholder for response data
    String line;
    // Response object
    Response res;
    // While connection is alive
    while(client.connected())
    {
      // Read one line
      line = client.readStringUntil('\n');

      // Print response to serial monitor
      // Serial.println(line);
      
      // A line starting with HTTP contains the status code
      if(line.startsWith("HTTP") && res.statusCode < 0)
      {
        // Take the appropriate substring and convert to an integer
        res.statusCode = line.substring(9, 12).toInt();
      }
      
      // If the line starts with a brace we have our response in JSON format
      if(line.startsWith("{"))
      {
        // End the connection
        client.stop();
        // Set the payload in our response object
        res.payload = line;
      }
    }

    // Return our response
    return res;
  }
  else
  {
    // Connection failed
    Serial.println("Misslyckades med att ansluta till AWS.");
    Response res;
    res.statusCode = -1;
    res.payload = "no connection";
    // Return a "no connection" response
    return res;
  }
}


void setup() {
  // Begin serial communication
  Serial.begin(9600);
    dht.setup(2); //Pin 2 DPin 4, <-Firstpin, Middlepin 3.3 v, Lastpin Grd.
  // Clear monitor
  // Serial.flush();
  delay(1000);

  Serial.print("Ansluter till ");
  Serial.print(".");
     WiFiManager wifiManager;
     wifiManager.autoConnect("AutoConnectAP");
  // Connecting to WiFi access point
  // WiFi.begin(ssid, password);

  // while(WiFi.status() != WL_CONNECTED)
  // {
  //   delay(500);
  //   Serial.print(".");
  // }
  
  Serial.print("Klar\nLokal IP-adress: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC-adress: ");
  Serial.println(WiFi.macAddress());

  // Set the MAC address query string
  macQuery = "MAC=" + WiFi.macAddress();

  // Sets the fingerprint for SSL encrypted connection
  client.setFingerprint(fingerprint);

  Serial.println("Hämtar info om denna enhet...");
  // Getting device info from API
  Response getRes = makeRequest("GET", "/device", macQuery + "&Concise=true", "");
  if(getRes.statusCode == 404) // Not Found
  {
    Serial.println("Ingen info hittades, skapar ny enhet...");

    // Adding device to database
    Response postRes = makeRequest("POST", "/device", macQuery, "");
    if(postRes.statusCode == 201) // Created
    {
      // Give instructions to user
      Serial.println("Enhet skapad, gör följande steg:");
      printRegisterGuide();
    }
  }
  else if(getRes.statusCode == 200) // OK
  {
    Serial.print("Enhet hittades ");

    // Find isRegistered and updateInterval
    int registeredIndex = getRes.payload.indexOf("\"isRegistered\":");
    int updateIntervalIndex = getRes.payload.indexOf("\"updateInterval\":");
    // If both keys are found
    if(registeredIndex >= 0 && updateIntervalIndex >= 0)
    {
      // Jump to isRegistered value
      int registeredStart = registeredIndex + 15;
      // Take the appropriate substring from the response
      // Since it's 5 characters, the response will be "false" or "true,"
      // The colon after "true" is the next key in the object
      String registered = getRes.payload.substring(registeredStart, registeredStart + 5);

      // Jump to updateInterval value
      int updateIntervalStart = updateIntervalIndex + 17;
      // Find the end of the value
      int updateIntervalEnd = getRes.payload.indexOf(',', updateIntervalStart);
      // Take the appropriate substring from the response
      updateInterval = getRes.payload.substring(updateIntervalStart, updateIntervalEnd).toInt() * 1000;
      
      // If not registered already
      if(registered == "false")
      {
        // Give instructions
        printRegisterGuide();
      }
      // If registered
      else if(registered.startsWith("true"))
      {
        Serial.print("och är registrerad, påbörjar mätning med intervallet ");
        Serial.print(updateInterval);
        Serial.println(" millisekunder...");
        // Begin measuring
        // am2320.begin();
        // Set isRegistered to true so the loop will run
        isRegistered = true;
      }
    }
    // If either key (isRegistered or updateInterval) is not found
    else
    {
      Serial.println("och är inte registrerad, gör följande steg:");
      // Give instructions
      printRegisterGuide();
    }
  }
}

void loop() {
  // Only measure and send data if registered
  if(isRegistered)
  {

    // Get current temperature and humidity
    MeasureData();
    // If either value is NaN
    if(temperature != temperature || humidity != humidity) {
      // The connection is loose, report to serial monitor
      Serial.println("Anslutningen till sensorn är glapp eller felgjord. Prövar igen om 20 sekunder.");
      delay(20000);
      return;
    }

    // Payload to send to API
    String payload = "{\"temperature\":" + String(temperature, 1) + ",\"humidity\":" + String(humidity, 1) + "}";
    Serial.print("Skickar data. Storlek: ");
    Serial.println(payload.length());
    // Send the data
    makeRequest("PUT", "/device/data", macQuery, payload);
    Serial.print("Väntar ");
    Serial.print(updateInterval);
    Serial.println(" millisekunder.");

    // Wait for next measurement
    delay(updateInterval);
  }
}

