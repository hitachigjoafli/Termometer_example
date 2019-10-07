# Dynamodb
![Querystring](https://github.com/abbjoafli/Termometer_example/blob/master/AWS_Lambda/Dynomdb.PNG?raw=true)

# APIGateway
## Struktur
![Querystring](https://github.com/abbjoafli/Termometer_example/blob/master/AWS_Lambda/API_GATEWAY.PNG?raw=true)
![Querystring](https://github.com/abbjoafli/Termometer_example/blob/master/AWS_Lambda/API_GATEWAY_stage.PNG?raw=true)

Nedan finns en tabell över vart i APIGateway vilken Lambda funktion används, samt om de använder Querystringparamters och vad den variabeln heter för mig ( I samtliga fall är det MAC, det vill säga MAC-adressen för att ta reda på vilken enhet som ska hanteras).
```javascript
 --/device
 --- Get iot_getDevice.js (Lambda Proxy integration, MAC)
 --- Post iot_createDevice.js (Lambda Proxy integration, MAC)
 --- Delete iot_remove.js (Lambda Proxy integration, MAC)
  --/data
   --- Put iot_uploadData.js (Lambda Proxy integration, MAC) 
   --- Delete iot_clearData.js  (Lambda Proxy integration, MAC)
  --/registered
   --- Get iot_getRegisteredDevices.js 
   --- Put iot_registerDevice.js (Lambda Proxy integration, MAC) 
   --- Delete ClearDeviceData  (Lambda Proxy integration, MAC)
  --/unregistered
   --- Get iot_getUnregisteredDevices.js

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

# TEST koder
## iot_getDevice.js
```javascript
{
  "queryStringParameters": {
    "MAC": "60:14:B3:AF:A2:65"
  }
}
```


## iot_createDevice.js
```javascript
{
  "queryStringParameters": {
    "MAC": "D4:6A:6A:2A:D4:87"
  }
}
```

## iot_registerDevice.js
```javascript
{
  "queryStringParameters": {
    "MAC": "D4:6A:6A:2A:D4:87"
  },
  "body": {
    "name": "Linus device",
    "owner": "Linus",
    "updateInterval": 500
  }
}
```

## iot_uploadData.js
```javascript
ex1
{
  "queryStringParameters": {
    "MAC": "60:14:B3:AF:A2:65"
  },
  "body": {
    "data":{
      "Temp":54,
      "Ljus":213
    }
  }
}
ex2
{  "queryStringParameters": {
    "MAC": "D4:6A:6A:2A:D4:87"
  },
  "body":{
      "temperature": 20
  }
}
```




## Möjliga Fel

När du testar, testa detta.
let body = event.body
Istället för
let body = JSON.parse(event.body);

Detta beror på att koden försöker klistra in en string och göra om den till JSON.
