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
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
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
                "Access-Control-Allow-Origin" : "*"
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
    // Continue only if MAC address is valid and provided.
    if(!verifyMAC(event, callback))
        return;

    // Get information from request body
    var deviceName; // required
    var owner; // required¨
    var time= 18000;

    // Check if body exists
    if(event.body) {
        const body = JSON.parse(event.body);

        // Ensure that name was specified
        if(body.name && typeof body.name === "string") {
            deviceName = body.name;
        }
        else {
            console.error("No name specified");
            callback(null, {
                statusCode: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                },
                body: JSON.stringify({
                    message: "Please specify device name as a string with key 'name'."
                })
            });
            return;
        }

        // Ensure that owner was specified
        if(body.owner && typeof body.owner === "string") {
            owner = body.owner;
        }
        else {
            console.error("No owner specified");
            callback(null, {
                statusCode: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                },
                body: JSON.stringify({
                    message: "Please specify owner name as a string with key 'owner'."
                })
            });
            return;
        }
console.log(body.updateInterval + "  "+ typeof body.updateInterval);
   if(body.updateInterval && typeof body.updateInterval === "number") {
            time = body.updateInterval;
        }
   
    }
    else {
        console.error("No body in request.");
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify({
                message: "Please specify device 'name' and 'owner' in request body."
            })
        });
        return;
    }

    // Capitalize to avoid case sensitivity
    const macAddress = event.queryStringParameters.MAC.toUpperCase();

    console.log(`Registering device with MAC address "${macAddress}"...`);

    docClient.get({
        TableName: "Devices",
        Key: {
            macAddress: macAddress
        },
        ProjectionExpression: "isRegistered, utcTimeCreated"
    }, (err, data) => {
        if(err) {
            callback(err, {
                statusCode: 500, // Internal Server Error
                headers: {
                    'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                },
                body: "An internal database query has failed."
            });
            return;
        }

        // If device is known
        if(data.hasOwnProperty("Item")) {
            
            if(data.Item.isRegistered) {
                console.error("Already registered.");
                
                callback(null, {
                    statusCode: 400, // Bad Request
                    headers: {
                        'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                    },
                    body: JSON.stringify({
                        message: "The device is already registered."
                    })
                });
                return;
            }
            
            console.log("Device found, registering.");
            
            var device = {
                macAddress: macAddress,
                name: deviceName,
                owner: owner,
                isRegistered: true,
                utcTimeCreated: data.Item.utcTimeCreated,
                utcTimeRegistered: new Date().toUTCString(),
                updateInterval: time,
                data: []
            };

            docClient.put({
                TableName: 'Devices',
                Item: device
            }, (err, data) => {
                if(err) {
                    callback(err, {
                        statusCode: 500, // Internal Server Error
                        headers: {
                            'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                        },
                        body: "An internal database write has failed."
                    });
                    return;
                }

                console.info("Device registered.");
                callback(null, {
                    statusCode: 200, // OK
                    headers: {
                        'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                    },
                    body: JSON.stringify({
                        message: "Device successfully registered."
                    })
                });
            });
        }
        else {
            console.error("Device not found.");
            callback(null, {
                statusCode: 404, // Not Found
                headers: {
                    'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*"
                },
                body: JSON.stringify({
                    message: "Device not found."
                })
            });
        }
    });
};
