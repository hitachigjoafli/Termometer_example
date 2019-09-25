# TEST koder
## iot_getDevice.js
{
  "queryStringParameters": {
    "MAC": "60:14:B3:AF:A2:65"
  }
}

## iot_createDevice.js
{  "queryStringParameters": {
    "MAC": "D4:6A:6A:2A:D4:87"
  },
  "body":{
      "temperature": 20
  }
}


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
