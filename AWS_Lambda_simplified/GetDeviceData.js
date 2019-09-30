const AWS = require('aws-sdk'); //AWS
//För Dynamodb
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

function HamtaAllaEnheter(e, callback) {

    let scanningParameters = {
        TableName: 'TempHum',
        Limit: 100
    }

    docClient.scan(scanningParameters, function (err, data) {
        if (err) {
            callback(err, null);
        } else
            callback(null, {
                statusCode: 200, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                body: JSON.stringify({
                    message: "All IOT devices",
                    Items: data
                })
            });
    });

}

function HamtaEnEnhet(e, callback) {

    if (!e.queryStringParameters.hasOwnProperty("name")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*" // Required for CORS support to work

            },
            body: JSON.stringify({
                message: "No 'name' query string provided. Examine your code for sending a connected device name.",
                e: e.queryStringParameters
            })
        });
        return false;
    }

    var params = {
        Key: {
            "Name": e.queryStringParameters.name
        },
        TableName: 'TempHum'
    };

    docClient.get(params, function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            console.log(data);
            if (data.hasOwnProperty("Item")) {
                callback(null, {
                    statusCode: 200, // Bad Request
                    headers: {
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                    },
                    body: JSON.stringify({
                        message: "Enheten finns reggad.",
                        data: data.Item
                    })
                });
            } else {
                callback(null, {
                    statusCode: 404, // Bad Request
                    headers: {
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                    },
                    body: JSON.stringify({
                        message: "Enheten finns inte reggad"
                    })
                });
            }


        }
    });

}
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