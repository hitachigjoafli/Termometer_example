# TEST koder
## iot_getDevice.js
{
  "queryStringParameters": {
    "MAC": "60:14:B3:AF:A2:65"
  }
}

## iot_createDevice.js


## iot_registerDevice.js
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
## iot_uploadData.js
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



## Möjliga Fel

När du testar, testa detta.
let body = event.body
Istället för
let body = JSON.parse(event.body);

Detta beror på att koden försöker klistra in en string och göra om den till JSON.
