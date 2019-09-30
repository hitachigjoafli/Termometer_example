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
        UpdateExpression: "set   #t = list_append(#t, :y), #h = list_append(#h, :i), #u = list_append(#u, :o), LastUpdate=:u, CurrentTemperature= :t,  CurrentHumidity= :h",
        ExpressionAttributeNames: {         //Dessa attribut är de som kommer att ändras. 
            "#t": "Temperature",
            "#u": "UpdatedAt",
            "#h": "Humidity",
        },
        ExpressionAttributeValues: {         //Dessa värden är de som kommer att ändras/läggas till. 
            ":y": [e.body.temperature], //[] runt värdet gör det till en lista, detta behövs då list_append tar bara emot listor och sammanfogar dem.
            ":i": [e.body.humidity],
            ":o": [new Date().toUTCString()],
            ":t": e.body.temperature,
            ":h": e.body.humidity,
            ":u": new Date().toUTCString()
        },
        ReturnValues: "UPDATED_NEW" //Man skickar ett returnvalue för att den ska veta att den ska uppdateras. 

    };

    console.log("Updating the item...");

    docClient.update(params, function (err, data) {
        if (err) {
            const response = {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                body: JSON.stringify('Gick inte att uppdatera IoT-enheten, försök igen eller titta på datan du skickar!'),
            };
            callback(err, response);
        } else {
            const response = {
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*" // Required for CORS support to work
                },
                statusCode: 200,
                body: JSON.stringify('Iot-enheten ' + e.queryStringParameters.name + ' är uppdaterad!'),
            };
            callback(null, response);
        }

    });

}