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

        Key: { //Lägger in nyckelvärdena 

            "Name": e.queryStringParameters.name

        },

        //Här nedan har vi UpdateExpression, där säger vi vilka attribut i objektet som ska länkas till vilka bokstäver. 
        UpdateExpression: "set   #t = :y, #h = :y, #u = :y , LastUpdate=:u, CurrentTemperature= :i,  CurrentHumidity= :i",
        ExpressionAttributeNames: { //Dessa attribut är de som kommer att ändras. 
            "#t": "Temperature",
            "#u": "UpdatedAt",
            "#h": "Humidity",
        },
        ExpressionAttributeValues: { //Dessa värden är de som kommer att ändras/läggas till. 
            ":y": [], //[] runt värdet gör det till en lista, detta behövs då list_append tar bara emot listor och sammanfogar dem.
            ":i": null,
            ":u": new Date().toUTCString()
        },
        ReturnValues: "UPDATED_NEW" //Man skickar ett returnvalue för att den ska veta att den ska uppdateras. 

    };

    console.log("Clearing the item...");

    docClient.update(params, function (err, data) {
        if (err) {
            const response = {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                body: JSON.stringify('Gick inte att tömma IoT-enhetens värden, försök igen eller titta på namnet du skickar!'),
            };
            callback(err, response);
        } else {
            const response = {
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                statusCode: 200,
                body: JSON.stringify('Iot-enheten ' + e.queryStringParameters.name + ' är tömd på värden!'),
            };
            callback(null, response);
        }

    });

}