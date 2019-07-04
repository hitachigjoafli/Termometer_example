const doc = require('aws-sdk');
const docClient = new doc.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

//Måste skicka med  Acces-Control.. för att CORS ska fungera med LAMBDA PROXY
//     "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
//https://devstufftoremember.wordpress.com/2016/10/26/cors-api-gateway-lambda-proxy/

const config = {
    macRegex: /^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/,
    conciseRegex: /^(?:true|false)$/
};

/**
 * Returns true if a provided MAC address exists and is valid.
 */
function verifyMAC(event, callback) {
    console.log(event);
    // Make sure MAC address parameter exists
    if(!event.queryStringParameters.hasOwnProperty("MAC")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
            },
            body: JSON.stringify({
                message: "No 'MAC' query string provided. Examine your IoT device for its unique MAC address."
            })
        });
        return false;
    }
    
    // Check if MAC string has correct structure
    if(!config.macRegex.test(event.queryStringParameters.MAC)) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
            },
            body: JSON.stringify({
                message: "Provided 'MAC' query was invalid. Example: A9:04:22:54:C2:F5. Examine your IoT device for its unique MAC address."
            })
        });
        return false;
    }
    
    return true;
}

// Entry function
exports.handler = (event, context, callback) => {
    if(!verifyMAC(event, callback))
        return;
    
    // The 'concise' variable excludes the data tag from the object if set to true
    // This is to avoid the ESP8266 chip from running out of memory
    var concise = false;
    // Check if the 'Concise' query string is present
    if(event.queryStringParameters.hasOwnProperty("Concise")) {
        // Validate the value of the query
        if(config.conciseRegex.test(event.queryStringParameters.Concise)) {
            // Acquire the value
            concise = event.queryStringParameters.Concise === "true";
        }
    }
    
    // Capitalize to avoid case sensitivity
    const macAddress = event.queryStringParameters.MAC.toUpperCase();
    
    console.log(`Searching for device with MAC address "${macAddress}"...`);
    
    docClient.get({
        TableName: "Devices",
        Key: {
            macAddress: macAddress
        }
    }, (err, data) => {
        if(err) {
            callback(err, {
                statusCode: 500, // Internal Server Error
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
                },
                body: "An internal database query has failed."
            });
            return;
        }
        
        // If device is known
        if(data.hasOwnProperty("Item")) {
            console.info("Device found.");
            
            // Exclude data points if concise information is requested
            if(concise && data.Item.hasOwnProperty("data")) {
                delete data.Item.data;
            }
            
            callback(null, {
                statusCode: 200, // OK
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
                },
                body: JSON.stringify(data["Item"])
            });
        }
        else {
            console.error("No device found.");
            callback(null, {
                statusCode: 404, // Not Found
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
                },
                body: JSON.stringify({
                    message: "Device not found."
                })
            });
        }
    });
};
