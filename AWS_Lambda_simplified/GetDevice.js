const AWS = require('aws-sdk'); //AWS
//För Dynamodb
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});


exports.handler = function (e, ctx, callback) {


    if (!e.queryStringParameters.hasOwnProperty("name")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*" // Required for CORS support to work
            },
            body: JSON.stringify({
                message: "No 'name' query string provided. Examine your IoT device for its unique name."
            })
        });
        return false;
    } else {

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
                            isRegistered: true
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
                            message: "Enheten finns inte reggad",
                            isRegistered: false
                        })
                    });
                }


            }

        });


    }


}