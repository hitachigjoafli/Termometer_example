const doc = require('aws-sdk');
const docClient = new doc.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

const config = {
    macRegex: /^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/
};

/**
 * Returns true if a provided MAC address exists and is valid.
 */
function verifyMAC(event, callback) {
    // Make sure MAC address parameter exists
    if(!event.queryStringParameters.hasOwnProperty("MAC")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
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
    
    // Capitalize to avoid case sensitivity
    var macAddress = event.queryStringParameters.MAC.toUpperCase();
    
    console.log(`Creating a device with MAC address "${macAddress}"...`);

    docClient.get({
        TableName: "Devices",
        Key: {
            macAddress: macAddress
        },
        ProjectionExpression: "macAddress"
    },
    (err, data) => {
        if(err) {
            callback(err, {
                statusCode: 500, // Internal Server Error
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "An internal database query has failed."
                })
            });
            return;
        }
        
        // If device is known
        if(data.hasOwnProperty("Item")) {
            console.error("Device already exists.");

            callback(null, {
                statusCode: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Device already created."
                })
            });
            return;
        }
        else {
            var device = {
                macAddress: macAddress,
                isRegistered: false,
                utcTimeCreated: new Date().toUTCString()
            };

            docClient.put({
                TableName: "Devices",
                Item: device
            },
            (err, data) => {
                if(err) {
                    callback(err, {
                        statusCode: 500, // Internal Server Error
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: "An internal database write has failed."
                        })
                    });
                    return;
                }

                console.info("Device created.");

                callback(null, {
                    statusCode: 201, // Created
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: "Device successfully created."
                    })
                });
            });
        }
    });
};
