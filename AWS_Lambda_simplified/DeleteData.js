const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});
exports.handler = function index(e, ctx, callback) {

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
    }

    console.log(e);
    var params = {

        TableName: "TempHum",

        Key: { //Lägger in nyckelvärdena som ska tas bort

            "Name": e.queryStringParameters.name

        },
    };

    console.log("Deleting the item...");

    docClient.delete(params, function (err, data) {
        if (err) {
            const response = {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                body: JSON.stringify('Gick inte att ta bort IoT-enheten, försök igen eller titta på namnet du skickar!'),
            };
            callback(err, response);
        } else {
            const response = {
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                statusCode: 200,
                body: JSON.stringify('Iot-enheten ' + e.queryStringParameters.name + ' är borta för alltid!'),
            };
            callback(null, response);
        }

    });

}