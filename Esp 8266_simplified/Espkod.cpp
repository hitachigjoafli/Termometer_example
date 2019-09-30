#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>            //Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     //Local WebServer used to serve the configuration portal
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager WiFi Configuration Magic    

float humidity =0;
float temperature = 0;

// Host URL for the API, paste your AWS URL
const String host = "y6ituq9hnf.execute-api.us-east-1.amazonaws.com";

// API Stage to use, paste your stage name here
const String stage = "test";

const String name = "name=Jockes_enhet"; //Name of unit
// Warning: This fingerprint expires December 14th 2019.
// To update it, view the SSL certificate in your browser:
//  1. Go to the host URL, se example belwo
//    "https://agafh7et1a.execute-api.us-east-1.amazonaws.com/"
//  2. Click the lock icon near the URL field
//  3. View the certificate
//  4. Copy the SHA-1 Fingerprint value to this string
//Alt, you can also use this site, https://www.grc.com/fingerprints.htm
const char *fingerprint = "72:D4:00:92:77:37:50:C9:9B:A1:38:FA:21:8A:9B:FD:BA:CF:CD:49";

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

// Prints the steps to register a device
void printRegisterGuide()
{
  //Här kan man ha instruktioner om hur man ska göra för att kunna använda iot-enheten
  Serial.println(" 1. Gå in på min hemsida (https...)");
  // Serial.println(" 2. );
  // Serial.print(" 3. ");
  Serial.println(" 4. Registrera den, och starta sedan om denna enhet");
}

void MeasureData(){
  //Example values, here should be AM2030 or DHT sensor
  int humvalue=20;
  int tempvalue=100;
//Code for measure data
if (isnan(humvalue)) {
    Serial.println(F("Error reading temperature!"));
  }
  else
  {
     humidity = humvalue;
      Serial.print("Humidity: ");
      Serial.print(humidity, 1);
    Serial.println(F("%"));
  Serial.print("\t\t");
  }
  
  if (isnan(tempvalue)) {
    Serial.println(F("Error reading temperature!"));
  }
  else
  {
      temperature = tempvalue;
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
      Serial.println(type   +"   "+host+ "/" + stage + uri + "?" + query + " HTTP/1.1");
    // Serial.println(payload);
    // // Writing HTTP request
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
   
  // Clear monitor
  // Serial.flush();
  delay(1000);

  Serial.print("Ansluter till ");
  Serial.print(".");
  WiFiManager wifiManager;
  wifiManager.autoConnect("AutoConnectAP"); //Döp om Wifihotspoten (Mikrokontrollen) genom att ändra namnet innanför parameterarna.
  // Connecting to WiFi access point //OldWAy/Slowway
  // WiFi.begin(ssid, password);

  // while(WiFi.status() != WL_CONNECTED)
  // {
  //   delay(500);
  //   Serial.print(".");
  // }
  
  Serial.print("Klar\nLokal IP-adress: ");
  Serial.println(WiFi.localIP());

  // Sets the fingerprint for SSL encrypted connection
  client.setFingerprint(fingerprint);

  Serial.println("Hämtar info om denna enhet...");
  // Getting device info from API
  Response getRes = makeRequest("GET", "/device", name , "");
  Serial.print(getRes.statusCode);
  if(getRes.statusCode == 404) // Not Found
  {
    Serial.println("Ingen info hittades, skapar ny enhet...");

    // Adding device to database
    Response postRes = makeRequest("POST", "/device", name, "");
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
    int updateIntervalIndex = getRes.payload.indexOf("\"UpdateFrequens\":");
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
    makeRequest("PATCH", "/device/data", name, payload);
    Serial.print("Väntar ");
    Serial.print(updateInterval);
    Serial.println(" millisekunder.");

    // Wait for next measurement
    delay(updateInterval);
  }
}

