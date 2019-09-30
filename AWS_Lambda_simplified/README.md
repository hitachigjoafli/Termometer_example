# Dynamodb
![Querystring](DynamoDb.png)

# TEST koder för Lambda och API Gateway
## AddTempDevice.js  - Skapa enhet
### Laggtilltest
{
  "queryStringParameters": {
  "name":"Berras IOT mätare"
  }
}
### Errortest
{
  "queryStringParameters": {
  }
}

## GetDevice.js - Titta om enhet finns
### Finnstest
{
  "queryStringParameters": {
  "name":"Berras IOT mätare"
  }
}
### FinnsInteTest
{
  "queryStringParameters": {
  "name":"Ankis IOT mätare"
  }
}
### Errortest
{
  "queryStringParameters": {
  }
}

## GetDeviceData.js - Hämta data, alla eller bara en
### HamtaEn
{
  "queryStringParameters": {
  "name":"Berras IOT mätare"
  }
}
### HamtaEnMedAllData
{
  "queryStringParameters": {
    "name": "Berras IOT mätare",
    "allData": false
  }
}
### HamtaAll
{
  "queryStringParameters": {
    "allData": true
  }
}
### Errortest
{
  "queryStringParameters": {
  }
}
{
  "queryStringParameters": {
        "allData": false
  }
}


## UpdateDevice - Uppdatera enhetsdata

### Uppdatera
{
  "queryStringParameters": {
    "name": "Berras IOT mätare"
  },
  "body": {
    "owner": "Berra",
    "place": "Sundbyvägen 4",
    "updateFrequens": 5000
  }
}

## UpdateDeviceData - Uppdatera värdedata

### Uppdatera
{
  "queryStringParameters": {
    "name": "Berras IOT mätare"
  },
  "body": {
    "temperature": 23,
    "humidity": 76
  }
}
## ClearDeviceData - Tömmer värdedata

### Tom
{
  "queryStringParameters": {
    "name": "Berras IOT mätare"
  }
}

## DeleteDevice - Ta bort enhet

### Ta bort
{
  "queryStringParameters": {
    "name": "Berras IOT mätare"
  }
}


## Möjliga Fel

När du testar, testa detta.
let body = event.body
Istället för
let body = JSON.parse(event.body);

Detta beror på att koden försöker klistra in en string och göra om den till JSON.

# API Gateway 

## Struktur
 --/device
 --- Get GetDevice (Lambda Proxy integration)
 --- Post AddDevice (Lambda Proxy integration)
 --- Delete DeleteDevice (Lambda Proxy integration)
  --/data
   --- Get GetDeviceData (Lambda Proxy integration)
   --- Post UpdateDeviceData (Lambda Proxy integration) 
   --- Delete ClearDeviceData  (Lambda Proxy integration)


## Möjliga fel
### Ingen Query string
Som du ser i bilden nedan är det en bra ide att llägga in URL Query String Paramtern name om man vill kunna skicka med det värdet till lambda funktionen. Man kan även klicka i required så slipper man ha en kontrollfunktion för name i lambda koden.
![Querystring](ApiGATEWAY-Querystring.png)