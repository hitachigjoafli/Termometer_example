
const AWS = require('aws-sdk');
const docCLient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
exports.handler = function index(e, ctx, callback) {
    
       if(!e.queryStringParameters.hasOwnProperty("name")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "No 'name' query string provided. Examine your IoT device for its unique name."
            })
        });
        return false;
    }
    let createdtime= new Date().toUTCString();
    var params = {
        Item: { Name: e.queryStringParameters.name, Created: createdtime, Temperature: [],  Humidity: [], UpdatedAt: [], CurrentTemperature: 0,  CurrentHumidity: 0, LastUpdate: createdtime, UpdateFrequens: 100, Place: "Unknown", NOwner:"None"  },
        TableName: 'TempHum'
    };
    docCLient.put(params, function(err, data) {
        if (err) {
                const response = {
        statusCode: 400,
        body: JSON.stringify('Gick inte att lägga till IoT-enheten, försök igen eller titta på datan du skickar!'),
    };
            callback(err, response);
        } else {
              const response = {
        statusCode: 200,
        body: JSON.stringify('Ny Iot-enhet tillagd! Med namnet '+e.queryStringParameters.name),
    };
            callback(null, response);
        }
    });
}