# Dynamodb
![Querystring](https://github.com/abbjoafli/Termometer_example/blob/master/AWS_Lambda_simplified/DynamoDb.PNG?raw=true)

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

```javascript
 --/device
 --- Get GetDevice (Lambda Proxy integration)
 --- Post AddDevice (Lambda Proxy integration)
 --- Delete DeleteDevice (Lambda Proxy integration)
  --/data
   --- Get GetDeviceData (Lambda Proxy integration)
   --- Post UpdateDeviceData (Lambda Proxy integration) 
   --- Delete ClearDeviceData  (Lambda Proxy integration)

```

## Möjliga fel
### Ingen Query string
Som du ser i bilden nedan är det en bra ide att llägga in URL Query String Paramtern name om man vill kunna skicka med det värdet till lambda funktionen. Man kan även klicka i required så slipper man ha en kontrollfunktion för name i lambda koden.
![Querystring](https://github.com/abbjoafli/Termometer_example/blob/master/AWS_Lambda_simplified/APIGATEWAY-Querystring.PNG?raw=true)

### Testvärden med Body
Om du varken i API Gateway eller postman kan testa/köra patch och post som innehåller en body så får du komma ihåg att man måste parsa värdet med json, detta gör man genom att skriva t.ex
```javascript
 let body = JSON.Parse(e.body); 
//kom ihåg sen att  använda body istället för e.body när du anropar body värden
let owner= body.owner;
//istället för
let owner= e.body.owner;

```
### allData vill inte fungera
Om inte allData vill fungera så kolla noga så du skapat en config med de olika möjliga värden för allData. Detta görs i regel för alla utom första Querystring parametern man skickar in. 
```javascript

const config = {
    allDataregex: /^(?:true|false)$/
};

exports.handler = function (e, ctx, callback) {

    if (e.queryStringParameters.hasOwnProperty("allData")) {
        // Validate the value of the query
        if (config.allDataregex.test(e.queryStringParameters.allData)) { //Om parameteren är true så vill vi hämta alla Enheter
            HamtaAllaEnheter(e, callback);
        } else { // Är den false så ska vi hämta en enhet

            HamtaEnEnhet(e, callback);
        }
    } else { // Skickas inte parametern med så antar vi att den bra vill ha en enhet

        HamtaEnEnhet(e, callback);

    }

}

```
